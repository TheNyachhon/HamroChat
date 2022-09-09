import moment from 'moment';
const formatMessage = (userid,text,time)=>{
    return{
        userid,
        text,
        time
        // time:moment().format('hh:mm a')
    }
}
const groupFormatMessage = (userDetails,userName,text)=>{
    return{
        userDetails,
        userName,
        text
    }
}

// module.exports = {
//     formatMessage:formatMessage
// };
// export const profileDetails = mongoose.model('userDetail' , userDetails);
// export const formatMessage= formatmessage;
export {formatMessage, groupFormatMessage}