import { AxiosError, AxiosResponse } from "axios";

export interface IAxiosOptions {
    name: string;
    type: string;
    url: string;
}

export interface IAPI<T> {
    fetch(options: IAxiosOptions): Promise<AxiosResponse<T>>;
    throw(options: IAxiosOptions, error: Error | AxiosError): never;
}