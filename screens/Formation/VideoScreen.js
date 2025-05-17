import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Video } from 'expo-av';
import config from '../../config.json';

export default function VideoScreen() {
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoList, setVideoList] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${config.API_Liste}/liste`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setVideoList(data);
        } else if (data && Array.isArray(data.videos)) {
          setVideoList(data.videos);
        } else {
          console.error('Format inattendu de la réponse :', data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des vidéos :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleSelectVideo = (filename) => {
    const fullUrl = `${config.API_Video}/${filename}`;
    setVideoUrl(fullUrl);
    setSelectedVideo(filename);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <>
          <View style={styles.videoSection}>
            {videoUrl ? (
              <>
                <Text style={styles.videoTitle}>
                  Vidéo en cours : {selectedVideo}
                </Text>
                <Video
                  source={{ uri: videoUrl }}
                  style={styles.video}
                  useNativeControls
                  resizeMode="contain"
                  isLooping
                />
              </>
            ) : (
              <Text style={styles.placeholder}>
                Sélectionnez une vidéo ci-dessous
              </Text>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.listContainer}>
            {videoList.length > 0 ? (
              videoList.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.videoButton,
                    selectedVideo === item && styles.selectedButton,
                  ]}
                  onPress={() => handleSelectVideo(item)}
                >
                  <Text style={styles.buttonText}>{item}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ color: '#fff' }}>Aucune vidéo disponible</Text>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  videoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  videoTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  placeholder: {
    color: '#aaa',
    fontSize: 16,
    marginVertical: 20,
  },
  listContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  videoButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedButton: {
    backgroundColor: '#007bff',
    borderColor: '#0056b3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
