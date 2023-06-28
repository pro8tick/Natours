import axios from 'axios'
import { showAlert } from './alerts';

export const login=async (email,password)=>{
    try{

        const res= await axios.post(
            'api/v1/users/login',
            {
                email,
                password
            });

        if(res.data.status=='success'){
            showAlert('success','Logged in successfully!!!')
            window.setTimeout(()=>location.assign('/'),1500)
            console.log(email,password)
        }
    }catch(err){
   
        showAlert('error',err.response.data.message)
    }
}

export const logout=async ()=>{
    try{
        const res= await axios({
            method:'GET',
            url:'http://localhost:8000/api/v1/users/logout',
        })
        if(res.data.status=='success') location.reload(true); //setting true will reload fresh page from server not from browser catch

    } catch(err){
        showAlert('error','Error logging out:Try again.')
    }
}

export const forgotPasswordSet=async (data)=>{
    try{
        const res= await axios({
            method:'POST',
            url:'api/v1/users/forgotPassword',
            data
        })
        if(res.data.status=='success'){
            showAlert('success','Redirecting To Reset Password Page')
            window.setTimeout(()=>location.assign('/reset-password'),1500)
        }; 

    } catch(err){
        showAlert('error',err.response.data.message)
    }
}