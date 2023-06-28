import axios from 'axios'
import { showAlert } from './alerts';

export const signup = async (details)=>{
    try{
        const res= await axios.post(
            'api/v1/users/signup',
             details
           );

        if(res.data.status=='success'){
            showAlert('success','Signed Up Successfully')
            window.setTimeout(()=>location.assign('/'),1500)
        }
    }catch(err){
        showAlert('error',err.response.data.message)
    }
}
