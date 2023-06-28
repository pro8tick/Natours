import '@babel/polyfill'
import { login,logout,forgotPasswordSet } from './login'
import {displayMap} from './mapbox'
import { updateSettings} from './updateSettings'
import { signup } from './signup'
import { bookTour } from './stripe'
//dom element
const mapBox=document.getElementById('map');
const loginform=document.querySelector('.form--login');
const logOutBtn= document.querySelector('.nav__el--logout')
const forgotPassword= document.querySelector('.form_el_forgot')
const userdataForm=document.querySelector('.form-user-data');
const usersignupForm=document.querySelector('.form-signup-data');
const userpasswordForm=document.querySelector('.form-user-password');
const bookBtn=document.getElementById('book-tour');

const handleResetPassword= (e)=>{
    e.preventDefault()
    forgotPasswordSet({email:document.getElementById('email').value})
}
//delegation
if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}


if(loginform){
    loginform.addEventListener('submit',e=>{
        e.preventDefault();
      
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email,password);
    })
}

if(logOutBtn) logOutBtn.addEventListener('click',logout)
if(forgotPassword) forgotPassword.addEventListener('click',handleResetPassword)

if(userdataForm){
    userdataForm.addEventListener('submit',e=>{
        e.preventDefault();
        const form=new FormData()
        form.append('name',document.getElementById('name').value);
        form.append('email',document.getElementById('email').value);
        form.append('photo',document.getElementById('photo').files[0]);
        updateSettings(form,'data');
    })
}

if(userpasswordForm){
    userpasswordForm.addEventListener('submit',async e=>{
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent='Updating'
        const passwordCurrent=document.getElementById('password-current').value;
        const password=document.getElementById('password').value;
        const passwordConfirm=document.getElementById('password-confirm').value;

        await updateSettings({passwordCurrent,password, },'password');

        document.getElementById('password-current').value='';
        document.getElementById('password').value='';
        document.getElementById('password-confirm').value='';
        document.querySelector('.btn--save-password').textContent='SAVE PASSWORD';
    
    })
}

if(usersignupForm){
    usersignupForm.addEventListener('submit',async e=>{
        e.preventDefault();
        const name=document.getElementById('name').value;
        const email=document.getElementById('email').value;
        const password=document.getElementById('password').value;
        const passwordConfirm=document.getElementById('password-confirm').value;
        signup({name,email,password,passwordConfirm})
    
    })
}


if(bookBtn){
    bookBtn.addEventListener('click',e=>{
        e.target.textContent = 'Processing.....';
        const {tourId} = e.target.dataset
        bookTour(tourId)
    })
}