import axios from "axios"

class AxiosService {
	constructor(baseURL = process.env.REACT_APP_ENDPOINT) {
		const instance = axios.create({
			baseURL,
			headers: {},
		})
		instance.interceptors.response.use(this.handleSuccess, this.handleError)
		this.instance = instance
	}

	setHeader(name, value) {
		this.instance.defaults.headers.common[name] = value
	}

	removeHeader(name) {
		delete this.instance.defaults.headers.common[name]
	}

	handleSuccess(response) {
		return response
	}

	handleError(error) {
	    if (error.response && error.response.status === 400) {
	        console.log(error.response.data)
	    } else {
	        return Promise.reject(error)
	    }
	}

	get(url, config) {
		return this.instance.get(url, config)
	}

	post(endpoint, data, config) {
		return this.instance.request({
			method: "POST",
			url: endpoint,
			responseType: "json",
			data,
			config,
		})
	}

	put(endpoint, data, config) {
		return this.instance.request({
			method: "PUT",
			url: endpoint,
			responseType: "json",
			data,
			config,
		})
	}

	delete(endpoint, data, config) {
		return this.instance.request({
			method: "DELETE",
			url: endpoint,
			responseType: "json",
			data,
			config,
		})
	}
}

export default AxiosService
