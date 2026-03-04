import api from "@/api/axios";

const  signUpUser = async (data) => {
    const response = await api.post("/user/create" , data ) ; 
    return response.data ;
}

export default signUpUser ;
