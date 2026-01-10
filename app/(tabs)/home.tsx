import BusinessCard from "@/src/components/home/BusinessCard";
import DateGuestSelector from "@/src/components/home/DateGuestSelector";
import DateRangePicker from "@/src/components/home/DateRangePicker";
import FilterButton from "@/src/components/home/FilterButton";
import HotelCard from "@/src/components/home/HotelCard";
import SearchBar from "@/src/components/home/SearchBar";
import { Bell, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("24 OCT-26 OCT");
  const [guests, setGuests] = useState(3);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);

  // Mock data - will be replaced with actual API calls
  const recommendedHotels = [
    {
      id: "1",
      name: "AYANA Resort",
      location: "Bali, Indonesia",
      rating: 4.5,
      priceMin: 200,
      priceMax: 500,
      discount: "10% OFF",
      imageUrl:
        "https://www.figma.com/api/mcp/asset/23b4a9be-c4cd-40ec-9c30-1ee1d0480a47",
    },
    {
      id: "2",
      name: "COMO Uma Re",
      location: "Bali, Indonesia",
      rating: 4.5,
      priceMin: 300,
      priceMax: 500,
      discount: "10% OFF",
      imageUrl:
        "https://www.figma.com/api/mcp/asset/1f32878d-8da3-4c92-86ae-d886f610c658",
    },
  ];

  const businessAccommodates = [
    {
      id: "1",
      name: "Conference Room",
      imageUrl:
        "https://www.figma.com/api/mcp/asset/0ef0a288-6de3-4718-9a70-dac9cfef6a55",
      amenities: ["Fast Wi-Fi", "AC Conference rooms"],
    },
    {
      id: "2",
      name: "Work Station",
      imageUrl:
        "https://www.figma.com/api/mcp/asset/b15f6f84-ad82-429a-a97f-56b443d1a64c",
      amenities: ["In-room work stations"],
    },
  ];

  const handleDatePress = () => {
    setIsDatePickerVisible(true);
  };

  const handleDateRangeSelect = (checkIn: Date, checkOut: Date) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);

    // Format dates for display
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const checkInStr = `${checkIn.getDate()} ${monthNames[checkIn.getMonth()]}`;
    const checkOutStr = `${checkOut.getDate()} ${
      monthNames[checkOut.getMonth()]
    }`;
    setDateRange(`${checkInStr}-${checkOutStr}`);
  };

  const handleGuestsPress = () => {
    // TODO: Open guest selector modal
    console.log("Open guest selector");
  };

  const handleFilterPress = () => {
    // TODO: Open filter modal
    console.log("Open filter");
  };

  const handleHotelPress = (id: string) => {
    // TODO: Navigate to hotel details
    console.log("Hotel pressed:", id);
  };

  const handleFavoritePress = (id: string) => {
    // TODO: Toggle favorite
    console.log("Favorite pressed:", id);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.locationLabel}>Location</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>Bali, Indonesia</Text>
            <ChevronDown size={16} color="#007ef2" />
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={19} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Date and Guest Selector */}
      <DateGuestSelector
        dateRange={dateRange}
        guests={guests}
        onDatePress={handleDatePress}
        onGuestsPress={handleGuestsPress}
      />

      {/* Search Bar and Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        <FilterButton onPress={handleFilterPress} />
      </View>

      {/* Recommended Hotels Section */}
      <Text style={styles.sectionTitle}>Recommended Hotels</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {recommendedHotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            {...hotel}
            onPress={() => handleHotelPress(hotel.id)}
            onFavoritePress={() => handleFavoritePress(hotel.id)}
          />
        ))}
      </ScrollView>

      {/* Business Accommodates Section */}
      <Text style={styles.sectionTitle}>Business Accommodates</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {businessAccommodates.map((business) => (
          <BusinessCard key={business.id} {...business} />
        ))}
      </ScrollView>

      <View style={styles.bottomSpacing} />

      {/* Date Range Picker Modal */}
      <DateRangePicker
        visible={isDatePickerVisible}
        onClose={() => setIsDatePickerVisible(false)}
        onSelectRange={handleDateRangeSelect}
        initialCheckIn={checkInDate}
        initialCheckOut={checkOutDate}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5fafe",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  locationLabel: {
    fontSize: 15,
    fontFamily: "Roboto",
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.81)",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 20,
    fontFamily: "OpenSans_700Bold",
    color: "#007ef2",
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "OpenSans_700Bold",
    color: "#007ef2",
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 10,
  },
  horizontalScroll: {
    marginBottom: 20,
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
  },
  bottomSpacing: {
    height: 80,
  },
});
