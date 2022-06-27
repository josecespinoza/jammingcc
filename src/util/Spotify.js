let userAccessToken = '';
//prod
const clientId = 'e5231f6ef73a403b85c184db64356e8f';
const redirectURI = 'https://jammingjce.surge.sh/';
//dev
/* const clientId = '69c8b5917eb54d7096c86af9e712048d';
const redirectURI = 'http://localhost:3000/'; */

const baseUrl = 'https://api.spotify.com';
const Spotify = {
    getAccessToken: () => {
        if(userAccessToken){
            return userAccessToken;
        }
        else{
            const url = window.location.href;
            if(url.match(/access_token=([^&]*)/)){
                userAccessToken = url.match(/access_token=([^&]*)/)[1];
                let expires_in = url.match(/expires_in=([^&]*)/)[1]; 
                window.setTimeout(() => {
                    userAccessToken = '';
                    window.history.pushState('Access Token', null, '/');
                },expires_in * 1000);
            }else{
                window.location = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
            }
        }
    },
    async search(searchTerm){
        const urlToFetch = `${baseUrl}/v1/search?type=track&q=${searchTerm}`;
        try {
            const response = await fetch(urlToFetch,{
                headers: {Authorization: `Bearer ${userAccessToken}`}
            });
            if(response.ok){
                const jsonResponse = await response.json();
                const tracks = jsonResponse.tracks.items.map((item)=>{
                    return {
                        id: item.id,
                        name: item.name,
                        artist: item.artists[0].name,
                        album: item.album.name,
                        uri: item.uri
                    }
                })
                return tracks;
            }
            throw new Error('Request failed');
        } catch (error) {
            console.log(error);
        }
    },

    async getUserId(token){
        const options = {
            method: 'GET',
            headers: {Authorization: `Bearer ${token}`}
        }
        try {
            const response = await fetch(`${baseUrl}/v1/me`,options);
            if(response.ok){
                const jsonResponse = await response.json();
                return jsonResponse.id;
            }
            
            return new Error ('There was a problem obtaining the id');

        } catch (error) {
            console.log(error);
        }
    },
    async addPlaylistTracks(playlistId, tracksURI, token){
        try {
            const options = {
                method: 'POST',
                headers: {Authorization: `Bearer ${token}`},
                body: JSON.stringify(tracksURI)
            }
            const response = await fetch(`${baseUrl}/v1/playlists/${playlistId}/tracks`,options);
            if(response.ok){
                const jsonResponse = await response.json();
                console.log(jsonResponse);
                return jsonResponse;
            }
            throw new Error('We could not add the tracks');
        } catch (error) {
            console.log(error);
        }
    }
    ,
    async savePlaylist(playlistName, tracksURI){
        if(playlistName && tracksURI){
            const token = userAccessToken;
            let userId = await this.getUserId(token);
            try {
                const options = {
                    method: 'POST',
                    body: JSON.stringify({
                        name: playlistName
                    }),
                    headers: {Authorization: `Bearer ${token}`}
                }
                const responsePlaylist = await fetch(`${baseUrl}/v1/users/${userId}/playlists`,options);
                if(responsePlaylist.ok){
                    const jsonResponse = await responsePlaylist.json();
                    const playlistId = jsonResponse.id;
                    return await this.addPlaylistTracks(playlistId, tracksURI, token);
                }
                return new Error ('There was a problem saving the playlist');
            } catch (error) {
                console.log(error);
            }
        }
        return;
    }
};



export {Spotify};
