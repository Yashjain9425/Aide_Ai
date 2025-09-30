import {Mic, ArrowDownToLine} from "lucide-react";
import React,{useState} from 'react'
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
const GenerateAudio = () => {
  const voiceList = [
    'Kore',
    'Zephyr',
    'Puck',
    'Charon',
    'Fenrir',
    'Leda',
    'Orus',
    'Aoede',
    'Callirrhoe',
  ]
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const {getToken} = useAuth()
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const {data} = await axios.post('/api/ai/generate-audio', {prompt: input, voice: selectedVoice}, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        setContent(data.content)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  const handleDownload = (audioUrl) => {
    try {
      if (!audioUrl || typeof audioUrl !== 'string') {
        throw new Error('Invalid audio URL');
      }
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const baseName = `aideai${randomSuffix}`;
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `${baseName}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
        <form onSubmit={onSubmitHandler} className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
                <Mic className="w-6 text-[#00ad25]" />
                <h1 className="text-xl font-semibold">AI Audio Generator</h1>
            </div>
            <p className="mt-6 text-sm font-semibold">Describe Your Audio</p>
                <textarea
                onChange={(e)=> setInput(e.target.value)}
                value={input}
                rows={4}
                className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
                placeholder="Describe what you want to hear in your audio..."
                required
                />
                <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
                  {voiceList.map((item) => (
                    <span
                      onClick={() => setSelectedVoice(item)}
                      className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                        selectedVoice === item
                          ? "bg-green-50 text-green-700"
                          : "text-gray-500 border-gray-300"
                      }`}
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <button disabled={loading} className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00ad25] to-[#04ff50] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer">
                    {loading ? <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span> : <Mic className="w-5 " />}
                    Generate Audio
                </button>
            </form>
            {/* right col */}
            <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-[#00ad25]" />
                <h1 className="text-xl font-semibold">Generated audio</h1>
              </div>
              {
                !content ? (
                  <div className="flex-1 flex justify-center items-center">
                    <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                      <Mic className="w-9 h-9" />
                      <p>Enter a topic and click "Generate Audio" to get started</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-3 h-full flex items-center justify-center">
                    <audio src={content} controls className="w-full" />
                    <div className="absolute top-2 right-2 z-10">
                      <ArrowDownToLine
                        onClick={() => handleDownload(content)}
                        className="w-9 h-9 p-2 rounded-full bg-white/90 text-black shadow-md hover:bg-white transition-colors duration-200 cursor-pointer"
                      />
                    </div>
                  </div>
                )
              }
            </div>
        </div>
    
  )
}

export default GenerateAudio
