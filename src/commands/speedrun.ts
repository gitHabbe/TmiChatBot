import axios, { AxiosInstance } from "axios";
import { speedrunConfig } from "../config/speedrunConfig";

const speedrunInstance: AxiosInstance = axios.create(speedrunConfig);

const getCategoryWorldRecord: string = ()