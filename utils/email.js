const nodemailer = require('nodemailer');
const pug =require('pug')
const htmlToText= require('html-to-text')

module.exports= class Email {
    constructor(user,url,resetToken=''){
        this.to=user.email;
        this.firstName= user.name.split(' ')[0];
        this.url=url;
        this.from=`Pratik Satpathy <${process.env.EMAIL_FROM}>`
        this.resetToken=resetToken
    }

    newTransport(){
        if(process.env.NODE_ENV==='production'){
            //send grid
            return nodemailer.createTransport({
              service:'SendGrid',
              auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
              }
            })
        }
        //use -https://mailsac.com/ to receve mail without creting an email
    
        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
        })
    }

    async send(template,subject){
        //send actual mail
        //1)render HTML based on a pug template
        const html= pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            firstName:this.firstName,
            url:this.url,
            subject,
            resetToken:this.resetToken
        })
        //2) Define email options
        const mailOptions={
            from:this.from,
            to:this.to,
            subject,
            html,
            text:htmlToText.fromString(html)
            
        }

        //3) create a transport and send email
        await this.newTransport().sendMail(mailOptions)
   }

   async sendWelcome(){
    await this.send('welcome', 'Welcome To the Natours Family')
   }

   async sendPasswordReset(){
    await this.send('passwordReset', 'Your Password Reset Token, Valid for only 10mins')
   }
}
// const nodemailer = require('nodemailer');

// const sendEmail = async options => {
//   // 1) Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   });

//   // 2) Define the email options
//   const mailOptions = {
//     from: 'Jonas Schmedtmann <hello@jonas.io>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//     // html:
//   };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail; 
 
