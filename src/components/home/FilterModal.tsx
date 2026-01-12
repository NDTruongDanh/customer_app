import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Check, ChevronDown, Minus, Plus, X } from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type SortOption = "price_asc" | "price_desc" | "rating_desc";

export interface RoomTypeOption {
  id: string;
  name: string;
}

export interface FilterState {
  sortBy: SortOption;
  minPrice: number;
  maxPrice: number;
  floor?: number;
  minCapacity?: number;
  maxCapacity?: number;
  roomTypeIds?: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  roomTypes?: RoomTypeOption[];
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Recommended", value: "rating_desc" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const DEFAULT_FILTERS: FilterState = {
  sortBy: "price_asc",
  minPrice: 500000,
  maxPrice: 5000000,
  roomTypeIds: [],
};

// Format number to Vietnamese Dong with thousand separators
const formatVND = (amount: number): string => {
  return amount.toLocaleString("vi-VN");
};

// Format price range display
const formatPriceRange = (min: number, max: number): string => {
  const minFormatted = formatVND(min);
  const maxFormatted = max >= 10000000 ? "10M+" : formatVND(max);
  return `${minFormatted}₫ - ${maxFormatted}₫`;
};

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
  roomTypes = [],
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [floorInput, setFloorInput] = useState(
    filters.floor !== undefined ? filters.floor.toString() : ""
  );

  const handlePriceRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }));
  };

  const handleFloorInputChange = (text: string) => {
    setFloorInput(text);
    const floorNumber = parseInt(text);
    // Treat empty, 0, or invalid as undefined (no floor filter)
    if (text === "" || isNaN(floorNumber) || floorNumber <= 0) {
      setFilters((prev) => ({ ...prev, floor: undefined }));
    } else {
      setFilters((prev) => ({ ...prev, floor: floorNumber }));
    }
  };

  const handleMinCapacityChange = (increment: boolean) => {
    setFilters((prev) => {
      const newMin = increment
        ? (prev.minCapacity || 1) + 1
        : Math.max(1, (prev.minCapacity || 1) - 1);
      return { ...prev, minCapacity: newMin };
    });
  };

  const handleMaxCapacityChange = (increment: boolean) => {
    setFilters((prev) => {
      const newMax = increment
        ? (prev.maxCapacity || 1) + 1
        : Math.max(1, (prev.maxCapacity || 1) - 1);
      return { ...prev, maxCapacity: newMax };
    });
  };

  const handleRoomTypeToggle = (roomTypeId: string) => {
    setFilters((prev) => {
      const currentIds = prev.roomTypeIds || [];
      const isSelected = currentIds.includes(roomTypeId);
      const newIds = isSelected
        ? currentIds.filter((id) => id !== roomTypeId)
        : [...currentIds, roomTypeId];
      return { ...prev, roomTypeIds: newIds };
    });
  };

  const isRoomTypeSelected = (roomTypeId: string): boolean => {
    return filters.roomTypeIds?.includes(roomTypeId) ?? false;
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setFloorInput("");
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const getSortLabel = () => {
    const option = SORT_OPTIONS.find((opt) => opt.value === filters.sortBy);
    return option?.label || "Recommended";
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Sort By Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort by</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowSortDropdown(!showSortDropdown)}
              >
                <Text style={styles.dropdownText}>{getSortLabel()}</Text>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>

              {showSortDropdown && (
                <View style={styles.dropdownMenu}>
                  {SORT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFilters((prev) => ({
                          ...prev,
                          sortBy: option.value,
                        }));
                        setShowSortDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          filters.sortBy === option.value &&
                            styles.dropdownItemTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Room Type Section */}
            {roomTypes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Room Type</Text>
                <View style={styles.roomTypeGrid}>
                  {roomTypes.map((roomType) => (
                    <TouchableOpacity
                      key={roomType.id}
                      style={[
                        styles.roomTypeChip,
                        isRoomTypeSelected(roomType.id) &&
                          styles.roomTypeChipSelected,
                      ]}
                      onPress={() => handleRoomTypeToggle(roomType.id)}
                    >
                      <Text
                        style={[
                          styles.roomTypeChipText,
                          isRoomTypeSelected(roomType.id) &&
                            styles.roomTypeChipTextSelected,
                        ]}
                      >
                        {roomType.name}
                      </Text>
                      {isRoomTypeSelected(roomType.id) && (
                        <Check size={14} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                {(filters.roomTypeIds?.length ?? 0) > 0 && (
                  <Text style={styles.selectedCount}>
                    {filters.roomTypeIds?.length} selected
                  </Text>
                )}
              </View>
            )}

            {/* Price Range Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <View style={styles.sliderContainer}>
                  <MultiSlider
                    values={[filters.minPrice, filters.maxPrice]}
                    min={0}
                    max={10000000}
                    step={100000}
                    onValuesChange={handlePriceRangeChange}
                    selectedStyle={styles.selectedTrack}
                    unselectedStyle={styles.unselectedTrack}
                    markerStyle={styles.marker}
                    sliderLength={280}
                  />
                </View>
                <Text style={styles.priceRangeText}>
                  {formatPriceRange(filters.minPrice, filters.maxPrice)}
                </Text>
              </View>
            </View>

            {/* Floor Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Floor</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter floor number"
                placeholderTextColor="#999"
                value={floorInput}
                onChangeText={handleFloorInputChange}
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>

            {/* Guest Capacity Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Guest Capacity</Text>

              {/* Minimum Guests */}
              <View style={styles.capacityRow}>
                <Text style={styles.capacityLabel}>Minimum Guests:</Text>
                <View style={styles.inlineCounter}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => handleMinCapacityChange(false)}
                  >
                    <Minus size={16} color="#007ef2" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>
                    {filters.minCapacity || 1}
                  </Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => handleMinCapacityChange(true)}
                  >
                    <Plus size={16} color="#007ef2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Maximum Guests */}
              <View style={styles.capacityRow}>
                <Text style={styles.capacityLabel}>Maximum Guests:</Text>
                <View style={styles.inlineCounter}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => handleMaxCapacityChange(false)}
                  >
                    <Minus size={16} color="#007ef2" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>
                    {filters.maxCapacity || 10}
                  </Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => handleMaxCapacityChange(true)}
                  >
                    <Plus size={16} color="#007ef2" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Indicator */}
          <View style={styles.bottomIndicator} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#007ef2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: "relative",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "OpenSans_700Bold",
    color: "#fff",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },
  resetButton: {
    padding: 4,
    zIndex: 1,
  },
  resetText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Roboto_400Regular",
  },
  closeButton: {
    padding: 4,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "OpenSans_600SemiBold",
    color: "#000",
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Roboto_400Regular",
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Roboto_400Regular",
  },
  dropdownItemTextActive: {
    color: "#007ef2",
    fontFamily: "Roboto_700Bold",
  },
  roomTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roomTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  roomTypeChipSelected: {
    backgroundColor: "#007ef2",
    borderColor: "#007ef2",
  },
  roomTypeChipText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Roboto_400Regular",
  },
  roomTypeChipTextSelected: {
    color: "#fff",
    fontFamily: "Roboto_500Medium",
  },
  selectedCount: {
    fontSize: 12,
    color: "#007ef2",
    fontFamily: "Roboto_400Regular",
    marginTop: 8,
  },
  priceRangeContainer: {
    paddingVertical: 8,
    alignItems: "center",
  },
  sliderContainer: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 20,
    alignItems: "center",
  },
  selectedTrack: {
    backgroundColor: "#007ef2",
    height: 4,
  },
  unselectedTrack: {
    backgroundColor: "#d3d3d3",
    height: 4,
  },
  marker: {
    backgroundColor: "#007ef2",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  priceRangeText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Roboto_400Regular",
    marginTop: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
    color: "#333",
    backgroundColor: "#fff",
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  capacityLabel: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: "#333",
  },
  inlineCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  counterValue: {
    fontSize: 16,
    fontFamily: "Roboto_500Medium",
    color: "#333",
    minWidth: 30,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  applyButton: {
    backgroundColor: "#007ef2",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Roboto_700Bold",
  },
  bottomIndicator: {
    height: 5,
    width: 134,
    backgroundColor: "#000",
    alignSelf: "center",
    marginBottom: 8,
    borderRadius: 3,
  },
});
