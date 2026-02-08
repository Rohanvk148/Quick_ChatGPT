import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {dummyChats, dummyUserData} from "../assets/assets.js"
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL

const AppContext = createContext()
export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedchats, setSelectedChats] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [loadingUser, setLoadingUser] = useState(true)

    // function to fetch user data from the server and set it in the context
    const fetchUser = async () => {
        try {
            const {data} = await axios.get('/api/user/userdata',{headers: {Authorization:token}})
            if(data.success)
                setUser(data.data.user)
            else
                toast.error(data.message)            
        } catch (error) {
            toast.error(error.message)
        }finally{
            setLoadingUser(false)
        }
    }

    // fuction to create new chat
    const createNewChat = async () => {
        try {
            if(!user)
                return toast('Please login to create a new chat')
            navigate('/')
            await axios.get('/api/chat/createchat', {headers: {Authorization:token}})
            // after creating new chat display it in the left sidebar in selected chats
            await fetchUserChats();
        } catch (error) {
            toast.error(error.message)
        }
    }

    // fetch all the chats of the user and set it in the context
    const fetchUserChats = async () => {
        try {
            const {data} = await axios.get('/api/chat/getuserchats', {headers: {Authorization:token}})
            if(data.success)
            {    
                setChats(data.chats)
                // if there are no chats or user has no chats then create a new chat for the user
                if(data.chats.length === 0)
                {
                    await createNewChat();
                    return fetchUserChats();
                }
                else
                {
                    setSelectedChats(data.chats[0])
                }
            }
            else
                toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if(theme === 'dark')
            document.documentElement.classList.add('dark')
        else
            document.documentElement.classList.remove('dark')
        
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        if (user)
        {
            fetchUserChats();
        }
        else 
        {
            setChats([])  
            setSelectedChats(null)
        }
    }, [user])

    useEffect(() => {
        if(token)   
            fetchUser();
        else
        {
            setUser(null)
            setLoadingUser(false)
        }
    },[token])

    const value = {navigate, user, setUser, chats, setChats, selectedchats, setSelectedChats, theme, setTheme, fetchUser, loadingUser,
        createNewChat, fetchUserChats, token, setToken, axios}
    return (
        <AppContext.Provider value={value} >
            {children}
        </AppContext.Provider>
    )
}
export const useAppContext = () => useContext(AppContext)