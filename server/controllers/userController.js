import sql from "../config/db.js";
import {cache} from '../config/cache.js'
import axios from 'axios'
export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth();
    const cacheKey = `userCreations:${userId}`;
    let creations;

    if (cache.has(cacheKey)) {
      creations = cache.get(cacheKey);
    } else {
      creations = await sql`
        SELECT * FROM creations 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC
      `;
      cache.set(cacheKey, creations);
    }

    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
    try { 
      let creations; 
      if(cache.has('publishedCreations')) {
        creations = cache.get('publishedCreations');
      }else{
        creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
        cache.set('publishedCreations', creations);
      }
      
  
      res.json({ success: true, creations });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  };
  

  export const toggleLikeCreation = async (req, res) => {
    try {  
        const { userId } = req.auth();
        const {id} = req.body

        const [creation] = await sql ` SELECT * FROM creations WHERE id = ${id}`

        if(!creation){
            return res.json({ success: false, message: "Creation not found"})
        }

        const currentLikes = creation.likes ||[];
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;
        
        if(currentLikes.includes(userIdStr)){
            updatedLikes = currentLikes.filter((user)=> user !== userIdStr);
            message = 'Creation Uliked'
        } else{
            updatedLikes = [...currentLikes, userIdStr]
            message = 'Creation Liked'
        }

        const formattedArray = `{${updatedLikes.join(',')}}`

        await sql `UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`

        cache.del('publishedCreations'); 
        cache.del(`userCreations:${userId}`);
        cache.del(`userCreations:${creation.user_id}`);
      res.json({ success: true, message, likes: updatedLikes });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  };
  
  export const downloadCreation = async (req, res) => {
    try {
      const { userId } = req.auth();
      const { id } = req.params;

      const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

      if (!creation) {
        return res.status(404).json({ success: false, message: "Creation not found" });
      }

      // Allow download if the creation is published or owned by the requester
      const isOwner = creation.user_id?.toString() === userId?.toString();
      if (!creation.publish && !isOwner) {
        return res.status(403).json({ success: false, message: "Not authorized to download this creation" });
      }

      if (creation.type !== 'image') {
        return res.status(400).json({ success: false, message: "Only image creations can be downloaded" });
      }

      const contentUrl = creation.content;
      if (!contentUrl || typeof contentUrl !== 'string' || !contentUrl.includes('/upload/')) {
        return res.status(400).json({ success: false, message: "Invalid image URL for download" });
      }
      // Stream the file from Cloudinary to avoid browser CORS/redirect issues
      const fileExtensionMatch = contentUrl.match(/\.(png|jpg|jpeg|webp|gif)(\?.*)?$/i);
      const fileExtension = fileExtensionMatch ? fileExtensionMatch[1].toLowerCase() : 'jpg';
      const safeFileName = `creation-${id}.${fileExtension}`;

      // Use the original URL (no redirect needed); set Content-Disposition for download
      const cloudinaryResponse = await axios.get(contentUrl, { responseType: 'stream' });
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
      res.setHeader('Content-Type', cloudinaryResponse.headers['content-type'] || 'application/octet-stream');
      cloudinaryResponse.data.pipe(res);
      cloudinaryResponse.data.on('error', () => {
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Error streaming file' });
        }
      });
      cloudinaryResponse.data.on('end', () => {
        if (!res.headersSent) {
          res.end();
        }
      });
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  };
  