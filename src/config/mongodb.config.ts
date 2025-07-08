
import {registerAs} from '@nestjs/config';

export default registerAs('mongodb', () => ({
    uri: process.env.MONGODB,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
}));



