import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Heart,ArrowDownToLine } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true)
  const {getToken} = useAuth()

  const fetchCreations = async () => {
    try {
      const {data} = await axios.get('/api/user/get-published-creations',{
        headers : {Authorization: `Bearer ${await getToken()}`}
      })

      if(data.success){
        setCreations(data.creations)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  };
  const handleDownload = (creation) => {
    try {
      const imageUrl = creation.content;
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Invalid image URL');
      }
      const randomSuffix = Math.floor(10000 + Math.random() * 90000); // 5 digits
      const baseName = `aideai${randomSuffix}`;
      const extMatch = imageUrl.match(/\.(png|jpg|jpeg|webp|gif)(\?.*)?$/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
      const downloadUrl = imageUrl.includes('/upload/')
        ? imageUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(baseName)}/`)
        : imageUrl;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${baseName}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const imageLikeToggle = async(id)=> {
    try {
      const {data} =  await axios.post('/api/user/toggle-like-creation',{id}, {
        headers : {Authorization: `Bearer ${await getToken()}`}
      })

      if(data.success){
        toast.success(data.message)
        await fetchCreations()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);
  return  !loading ?(
    <div className="flex-1 g-full flex flex-col gap-4 p-6">
      Creations
      <div className="bg-white h-full w-full rounded-xl overflow-y-scroll">
        {creations.map((creation, index) => (
          <div
            key={index}
            className="relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3"
          >
            <img
              src={creation.content}
              alt=""
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute top-5 right-2 z-10">
              <ArrowDownToLine
                onClick={() => handleDownload(creation)}
                className="w-9 h-9 p-2 rounded-full bg-white/90 text-black shadow-md hover:bg-white transition-colors duration-200 cursor-pointer"
              />
            </div>
            <div className="absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg">
              <p className="text-sm hidden group-hover:block">
                {creation.prompt}
              </p>
              <div className="flex gap-1 items-center">
                <p>{creation.likes.length}</p>
                <Heart onClick={()=> imageLikeToggle(creation.id)}
                  className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${
                    creation.likes.includes(user.id)
                      ? "fill-red-500 text-red-600"
                      : "text-white"
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ):(
    <div className="flex justify-center items-center h-full">
      <span className="w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin"></span>
    </div>
  );
};

export default Community;
