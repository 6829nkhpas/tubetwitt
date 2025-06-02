class ApiResponse{
    constructor(statusCode , data, messsage ="Success"){
        this.data=data;
        this.messsage=messsage;
        this.statusCode= statusCode;
        this.success = success < 400;
    }
}
export{ApiResponse};