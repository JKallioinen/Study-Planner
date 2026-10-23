import axios from "axios";

const api = axios.create({
  baseURL:
    "https://study-planner-c3dxh3ghgpfmgvem.germanywestcentral-01.azurewebsites.net",
});

export default api;