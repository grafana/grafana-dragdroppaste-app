package plugin

import (
	"encoding/base64"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"
)

// handlePing is an example HTTP GET resource that returns a {"message": "ok"} JSON response.
func (a *App) handlePing(w http.ResponseWriter, req *http.Request) {
	w.Header().Add("Content-Type", "application/json")
	if _, err := w.Write([]byte(`{"message": "ok"}`)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (a *App) handleFile(w http.ResponseWriter, req *http.Request) {

	path := req.URL.Path
	fileID := strings.TrimPrefix(path, "/file/")

	// need to fetch host and basic auth from somewhere? should be stored somewhere
	req, err := http.NewRequest("GET", "http://localhost:3000/apis/file.grafana.app/v0alpha1/namespaces/default/files/"+fileID+"/data", nil)
	if err != nil {
		http.Error(w, "err", http.StatusInternalServerError)
		return
	}

	req.Header.Add("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte("admin:admin")))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "err", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "err", http.StatusInternalServerError)
		return
	}

	var data interface{}
	err = json.Unmarshal([]byte(body), &data)
	if err != nil {
		http.Error(w, "err", http.StatusInternalServerError)
		return
	}

	base64Contents := ""
	if dataMap, ok := data.(map[string]interface{}); ok {
		if spec, ok := dataMap["spec"].(map[string]interface{}); ok {
			if dataArray, ok := spec["data"].([]interface{}); ok {
				// Assuming the "data" array has at least one element
				if dataObj, ok := dataArray[0].(map[string]interface{}); ok {
					if contents, ok := dataObj["Contents"].(string); ok {
						base64Contents = strings.Split(contents, ",")[1]
					}
				}
			}
		}
	}

	if base64Contents == "" {
		http.Error(w, "err", http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "image/jpeg")
	imageData, err := base64.StdEncoding.DecodeString(base64Contents)
	if err != nil {
		http.Error(w, "Failed to decode Base64 image", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "image/png")
	w.Write(imageData)
}

// handleEcho is an example HTTP POST resource that accepts a JSON with a "message" key and
// returns to the client whatever it is sent.
func (a *App) handleEcho(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		Message string `json:"message"`
	}
	if err := json.NewDecoder(req.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Add("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(body); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// registerRoutes takes a *http.ServeMux and registers some HTTP handlers.
func (a *App) registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/ping", a.handlePing)
	mux.HandleFunc("/echo", a.handleEcho)
	mux.HandleFunc("/file/{file}", a.handleFile)
}
