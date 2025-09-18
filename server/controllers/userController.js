import sql from "../config/db.js";
import {cache} from '../config/cache.js'
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
  