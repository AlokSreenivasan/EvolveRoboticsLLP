import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

export default function CourseCard() {
  const [playing, setPlaying] = useState(false);

  return (
    <View style={styles.courseCard}>
      {playing ? (
        // Show YouTube Player
        <YoutubePlayer
          height={240}
          play={true}
          videoId={"dQw4w9WgXcQ"} // 👈 Extracted from your URL
        />
      ) : (
        // Show Thumbnail
        <TouchableOpacity onPress={() => setPlaying(true)}>
          <Image
            source={{
              uri: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
            }}
            style={styles.thumbnail}
          />

          {/* Info Section */}
          <View style={styles.info}>
            <Text numberOfLines={2} style={styles.title}>
              Amazing Learning Journey with React Native
            </Text>
            <Text style={styles.channel}>Tech Channel</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  courseCard: {
    width: 300,
    height: 240,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginLeft: 10,
    paddingTop: 10,
    top:20,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    // Android
    elevation: 3,
    // iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  thumbnail: {
    width: "100%",
    height: "60%", // top half for thumbnail
  },
  info: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  channel: {
    fontSize: 12,
    color: "gray",
  },
});
