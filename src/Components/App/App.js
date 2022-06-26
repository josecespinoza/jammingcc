import './App.css';
import React from 'react';
import { SearchBar } from './../SearchBar/SearchBar';
import { SearchResults } from './../SearchResults/SearchResults';
import { Playlist } from './../Playlist/Playlist';
import { Spotify } from '../../util/Spotify';

export class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      searchResults: [],
      playlistName: '',
      playlistTracks: []
    };
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
    Spotify.getAccessToken();
  }

  addTrack(track){
    if(this.state.playlistTracks.find(savedTrack => savedTrack.id) === track.id){
      return;
    }
    const newplaylistTracks = this.state.playlistTracks;
    newplaylistTracks.push(track);
    this.setState({
      playlistTracks: newplaylistTracks
    });    
  }

  removeTrack(track){
    const newplaylistTracks = this.state.playlistTracks.filter(ptrack => ptrack.id !== track.id);
    this.setState({
      playlistTracks: newplaylistTracks
    });
  }

  updatePlaylistName(name){
    this.setState({
      playlistName: name
    })
  }

  savePlaylist(){
    let trackURIs = {uris: []};
    this.state.playlistTracks.forEach((track)=>{
      trackURIs.uris.push(track.uri);
    });
    Spotify.savePlaylist(this.state.playlistName,trackURIs);
  }

  async search(searchTerm){
    const foundTracks = await Spotify.search(searchTerm);
    this.setState({searchResults: foundTracks});
  }

  render(){
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch = {this.search}/>
          <div className="App-playlist">
            <SearchResults searchResults = {this.state.searchResults} onAdd = {this.addTrack}/>
            <Playlist 
              playlistName = {this.state.playlistName} 
              playlistTracks = {this.state.playlistTracks} 
              onRemove = {this.removeTrack} 
              onNameChange = {this.updatePlaylistName} 
              onSave = {this.savePlaylist}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
