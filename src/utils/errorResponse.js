class Apierror extends Error{
    constructor(
        statusCode,
        errors=[],
        stack="",
        message="Something Wents Wrong!!"
    ){
        super(message);
        this.errors=errors;
        this.statusCode=statusCode;
        this.data =null;
        this.message=message;
        this.success = false;
        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this, this.constructor)
    
        }
    }
    
}
export{Apierror}