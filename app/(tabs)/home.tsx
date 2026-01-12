import BusinessCard from "@/src/components/home/BusinessCard";
import DateGuestSelector from "@/src/components/home/DateGuestSelector";
import DateRangePicker from "@/src/components/home/DateRangePicker";
import FilterButton from "@/src/components/home/FilterButton";
import FilterModal, {
  FilterState,
  RoomTypeOption,
} from "@/src/components/home/FilterModal";
import RoomCard from "@/src/components/home/RoomCard";
import SearchBar from "@/src/components/home/SearchBar";
import { useRooms } from "@/src/hooks";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("Select Dates");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "price_asc",
    minPrice: 500000,
    maxPrice: 5000000,
  });

  // Build search params for rooms query
  const searchParams = useMemo(() => {
    if (!checkInDate || !checkOutDate) return undefined;

    const params: any = {
      page: 1,
      limit: 10,
      checkInDate: checkInDate.toISOString().split("T")[0],
      checkOutDate: checkOutDate.toISOString().split("T")[0],
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    };

    // Only include optional filters if they have values
    if (filters.minCapacity) params.minCapacity = filters.minCapacity;
    if (filters.maxCapacity) params.maxCapacity = filters.maxCapacity;
    if (filters.floor && filters.floor > 0) params.floor = filters.floor;

    return params;
  }, [checkInDate, checkOutDate, filters]);

  // Use TanStack Query for rooms - enabled only when dates are selected
  const {
    data: roomsResponse,
    isLoading: isLoadingRooms,
    error: roomsQueryError,
    refetch: refetchRooms,
  } = useRooms(searchParams, { enabled: !!searchParams });

  // Extract rooms from grouped data structure
  // API returns: { data: { data: [{ roomType, availableCount, rooms: Room[] }] } }
  const roomGroups = roomsResponse?.data?.data ?? [];

  // Extract unique room types for filter options
  const availableRoomTypes: RoomTypeOption[] = useMemo(() => {
    return roomGroups.map((group: any) => ({
      id: group.roomType.id,
      name: group.roomType.name,
    }));
  }, [roomGroups]);

  // Apply client-side sorting and room type filtering
  const sortedRoomGroups = useMemo(() => {
    let groups = [...roomGroups];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      groups = groups.filter((group: any) =>
        group.roomType.name.toLowerCase().includes(query)
      );
    }

    // Filter by room type if any are selected
    if (filters.roomTypeIds && filters.roomTypeIds.length > 0) {
      groups = groups.filter((group: any) =>
        filters.roomTypeIds?.includes(group.roomType.id)
      );
    }

    // Apply sorting
    if (filters.sortBy === "price_asc") {
      groups.sort(
        (a: any, b: any) =>
          parseFloat(a.roomType.basePrice) - parseFloat(b.roomType.basePrice)
      );
    } else if (filters.sortBy === "price_desc") {
      groups.sort(
        (a: any, b: any) =>
          parseFloat(b.roomType.basePrice) - parseFloat(a.roomType.basePrice)
      );
    }
    return groups;
  }, [roomGroups, filters.sortBy, filters.roomTypeIds, searchQuery]);

  // Count total rooms across all groups
  const totalRooms = sortedRoomGroups.reduce(
    (acc: number, group: any) => acc + (group.rooms?.length ?? 0),
    0
  );

  // Format error message
  const roomsError = useMemo(() => {
    if (!roomsQueryError) return null;
    const error = roomsQueryError as any;
    if (error.response?.status === 401 || error.response?.data?.code === 401) {
      return "Please login to view available rooms.";
    }
    return (
      error.response?.data?.message || "Failed to load rooms. Please try again."
    );
  }, [roomsQueryError]);

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

  const handleFilterPress = () => {
    setIsFilterVisible(true);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleRoomPress = (id: string) => {
    if (!id) {
      console.error("Room ID is missing");
      return;
    }
    router.push({
      pathname: "/room-details",
      params: {
        id,
        checkInDate: checkInDate?.toISOString(),
        checkOutDate: checkOutDate?.toISOString(),
      },
    });
  };

  const handleFavoritePress = (id: string) => {
    // TODO: Toggle favorite
    console.log("Favorite pressed:", id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            Room <Text style={{ color: "#007ef2" }}>Master</Text>
          </Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={19} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Date and Guest Selector */}
        <DateGuestSelector
          dateRange={dateRange}
          onDatePress={handleDatePress}
        />

        {/* Search Bar and Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
          </View>
          <FilterButton onPress={handleFilterPress} />
        </View>

        {/* Available Rooms Section */}
        <Text style={styles.sectionTitle}>Available Rooms</Text>

        {!checkInDate || !checkOutDate ? (
          <View style={styles.selectDatesContainer}>
            <Text style={styles.selectDatesText}>
              Please select check-in and check-out dates to view available rooms
            </Text>
          </View>
        ) : isLoadingRooms ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007ef2" />
          </View>
        ) : roomsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{roomsError}</Text>
            <TouchableOpacity
              onPress={() => refetchRooms()}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : totalRooms === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rooms available</Text>
          </View>
        ) : (
          <View style={styles.roomsContainer}>
            {sortedRoomGroups.map((group: any) => (
              <View key={group.roomType.id} style={styles.roomTypeGroup}>
                {/* Room Type Header */}
                <View style={styles.roomTypeHeader}>
                  <Text style={styles.roomTypeTitle}>
                    {group.roomType.name}
                  </Text>
                  <Text style={styles.roomTypeCount}>
                    {group.rooms?.length ?? 0} room
                    {group.rooms?.length !== 1 ? "s" : ""}
                  </Text>
                </View>

                {/* 2-Column Grid of Rooms */}
                <View style={styles.roomsGrid}>
                  {(group.rooms ?? []).map((room: any) => (
                    <View key={room.id} style={styles.roomCardWrapper}>
                      <RoomCard
                        room={room}
                        onPress={() => handleRoomPress(room.id)}
                        onFavoritePress={() => handleFavoritePress(room.id)}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

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

        {/* Filter Modal */}
        <FilterModal
          visible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          onApply={handleApplyFilters}
          initialFilters={filters}
          roomTypes={availableRoomTypes}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5fafe",
  },
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
  },
  logo: {
    fontWeight: "bold",
    fontSize: 20,
    fontFamily: "OpenSans_700Bold",
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: "#ff0000",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#007ef2",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    color: "#fff",
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: "#7f7f7f",
    textAlign: "center",
  },
  selectDatesContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  selectDatesText: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: "#007ef2",
    textAlign: "center",
  },
  roomsContainer: {
    paddingHorizontal: 20,
  },
  roomTypeGroup: {
    marginBottom: 24,
  },
  roomTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  roomTypeTitle: {
    fontSize: 16,
    fontFamily: "OpenSans_600SemiBold",
    color: "#333",
  },
  roomTypeCount: {
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    color: "#7f7f7f",
  },
  roomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  roomCardWrapper: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
});
