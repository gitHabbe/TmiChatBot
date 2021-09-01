import axios, { AxiosRequestConfig, AxiosInstance } from "axios";

const pokemonConfig: AxiosRequestConfig = {
  baseURL: `https://pokeapi.co/api/v2`,
};

export const pokemonAPI: AxiosInstance = axios.create(pokemonConfig);
