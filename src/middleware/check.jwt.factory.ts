import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jwt-redis";
import JwtServiceInterface from "../auth/jwt/jwt.service.interface";

function createJwtMiddleware(factory: () => JwtServiceInterface) {
    const jwtService: JwtServiceInterface = factory();
    return async function checkJwtMiddleware(req: Request, res: Response, next: NextFunction) {
        try {
            const tokenHeader = <string>req.headers['authorization'];
            if (!tokenHeader) {
                res.status(401).send({'message': 'No access token provided'});
                return;
            }
            const token = tokenHeader.substr(tokenHeader.indexOf(' ') + 1);
            await jwtService.verify(token);
            next();
        } catch (err) {
            if(err instanceof JsonWebTokenError) {
                res.status(401).send({'message': 'Error occurred while verifing token'});
            } else if(err instanceof TokenExpiredError) {
                res.status(401).send({'message': 'Access token has expired'});
            } else {
                res.status(401).send({'message': 'Invalid access token has been provided'})
            }
        }
    }
}

export {createJwtMiddleware};