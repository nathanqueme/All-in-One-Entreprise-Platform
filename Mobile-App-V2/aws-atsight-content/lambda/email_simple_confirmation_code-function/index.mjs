
'use strict';

export const handler = async (event, context, callback) => {
  
  // AWS data 
  const email = event.request.userAttributes.email;
  const username = event.request.usernameParameter; // Is null ... 
  const code = event.request.codeParameter
    
  // AtSight's ressources 
  const icon_url = "https://firebasestorage.googleapis.com/v0/b/hosting-7df93.appspot.com/o/AtSight_icon_64X64.png?alt=media&token=7595e319-4b82-47c0-ae78-c9707c184258" // require('../assets/emailTemplateFiles/AtSight_icon_64X64.png')
  const logo_url = "https://firebasestorage.googleapis.com/v0/b/hosting-7df93.appspot.com/o/AtSight_logo_234X64.png?alt=media&token=dcf8b402-7f2e-46ae-bfb9-81830ee0ff6d" // require('../assets/emailTemplateFiles/AtSight_logo_234X64.png')

  const template = () => `
  <html>
   <head>
    <style>
    </style>
   </head>
 
   <body>
     <img src=${logo_url} width="95" height="25" />
       
       <p style="font-size: 15px; font-weight: medium; color: #999999;">Hello,
       <br>
       Your confirmation code is ${code}
       </p>
       
   </body>
   
  </html>`



  if (event.triggerSource === "CustomMessage_SignUp" || event.triggerSource === "CustomMessage_ResendCode") {

    event.response = {
        emailSubject: "Your verification code",
        emailMessage: template(),
        smsMessage: "Your confirmation code is " + code
    };
   }
  

  callback(null, event);
};