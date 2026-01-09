import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Decorative Background Images */}
      <View style={styles.imageContainer}>
        {/* Main large circular image - top left */}
        <View style={styles.mainImageWrapper}>
          <Image
            source={{
              uri: "https://www.figma.com/api/mcp/asset/bfcaac28-a6b8-433e-af14-524ef057c953",
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* Small circular image - bottom left */}
        <View style={styles.smallImageLeft}>
          <Image
            source={{
              uri: "https://www.figma.com/api/mcp/asset/e2c07ef3-9616-4c73-8645-eed20b3b0875",
            }}
            style={styles.smallImageStyle}
            resizeMode="cover"
          />
        </View>

        {/* Small circular image - top right */}
        <View style={styles.smallImageRight}>
          <Image
            source={{
              uri: "https://www.figma.com/api/mcp/asset/cfed94f4-9caa-4fe8-9b19-8404447ecb9e",
            }}
            style={styles.smallImageStyle}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Unleash Your Inner Traveller</Text>
        <Text style={styles.description}>
          Your passport to a world of extraordinary hotel experiences. Join us
          today and unlock a realm of comfort, luxury, and adventure.
        </Text>

        {/* Start Exploring Button */}
        <Pressable style={styles.button} onPress={() => router.push("/signup")}>
          <Text style={styles.buttonText}>Start Exploring</Text>
          <MaterialIcons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
            style={styles.arrowIcon}
          />
        </Pressable>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.loginLink}>Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAFE",
  },
  imageContainer: {
    position: "relative",
    height: "50%",
  },
  mainImageWrapper: {
    position: "absolute",
    left: 50,
    top: 96,
    width: 276,
    height: 315,
    borderRadius: 276 / 2,
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  smallImageLeft: {
    position: "absolute",
    left: -42,
    top: 356,
    width: 117,
    height: 109,
    borderRadius: 117 / 2,
    overflow: "hidden",
  },
  smallImageRight: {
    position: "absolute",
    right: "20%",
    top: 7,
    width: 117,
    height: 118,
    borderRadius: 117 / 2,
    overflow: "hidden",
  },
  smallImageStyle: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "System",
    fontWeight: "bold",
    fontSize: 24,
    color: "#007EF2",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 15,
    color: "rgba(0, 0, 0, 0.81)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#007EF2",
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 318,
    marginBottom: 20,
  },
  buttonText: {
    fontFamily: "System",
    fontWeight: "600",
    fontSize: 18,
    color: "#FFFFFF",
    marginRight: 8,
  },
  arrowIcon: {
    transform: [{ rotate: "-45deg" }],
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  loginText: {
    fontFamily: "System",
    fontSize: 15,
    color: "rgba(0, 0, 0, 0.6)",
  },
  loginLink: {
    fontFamily: "System",
    fontSize: 15,
    color: "#FFD700",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
