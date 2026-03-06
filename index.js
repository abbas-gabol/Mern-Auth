import dotenv from 'dotenv';
dotenv.config({path:'./.env'});

import app from './app.js';
import connectDB from './src/config/database.js';

const startserver = async()=>{
    try{
        await connectDB();

        app.listen(process.env.PORT || 8000,()=>{
            console.log(`Server running on port ${process.env.PORT || 8000}`);
        });


    }catch(error){
        console.error('Startup failed',error);
        throw error;
    }
};

startserver();