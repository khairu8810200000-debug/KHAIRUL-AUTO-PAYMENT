// Backend sahaja. Jangan import fail ini dalam browser.
async function sendTemplate({to,templateName,languageCode="ms",components=[]}){
 const token=process.env.WHATSAPP_TOKEN, phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID, version=process.env.WHATSAPP_API_VERSION||"v22.0";
 if(!token||!phoneId||!templateName) throw new Error("WhatsApp secrets/template belum dikonfigurasi.");
 if(!/^\\d{8,15}$/.test(String(to))) throw new Error("Nombor penerima mesti format antarabangsa tanpa +.");
 const res=await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to,type:"template",template:{name:templateName,language:{code:languageCode},components}})});
 const data=await res.json();if(!res.ok)throw new Error(JSON.stringify(data));return data;
}
module.exports={sendTemplate};