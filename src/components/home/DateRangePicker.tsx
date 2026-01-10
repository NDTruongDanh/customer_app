import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectRange: (checkIn: Date, checkOut: Date) => void;
  initialCheckIn?: Date;
  initialCheckOut?: Date;
}

export default function DateRangePicker({
  visible,
  onClose,
  onSelectRange,
  initialCheckIn,
  initialCheckOut,
}: DateRangePickerProps) {
  const [checkInDate, setCheckInDate] = useState<string | null>(
    initialCheckIn ? initialCheckIn.toISOString().split("T")[0] : null
  );
  const [checkOutDate, setCheckOutDate] = useState<string | null>(
    initialCheckOut ? initialCheckOut.toISOString().split("T")[0] : null
  );

  const formatDateDisplay = (dateString: string | null) => {
    if (!dateString) return "Select";
    const date = new Date(dateString);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  const handleDayPress = (day: DateData) => {
    const selectedDate = day.dateString;

    // If no check-in date, set it
    if (!checkInDate) {
      setCheckInDate(selectedDate);
      setCheckOutDate(null);
      return;
    }

    // If check-in is set but no check-out, set check-out
    if (checkInDate && !checkOutDate) {
      if (selectedDate > checkInDate) {
        setCheckOutDate(selectedDate);
      } else {
        // If selected date is before check-in, reset and set as new check-in
        setCheckInDate(selectedDate);
        setCheckOutDate(null);
      }
      return;
    }

    // If both are set, reset and start over
    setCheckInDate(selectedDate);
    setCheckOutDate(null);
  };

  const handleConfirm = () => {
    if (checkInDate && checkOutDate) {
      onSelectRange(new Date(checkInDate), new Date(checkOutDate));
      onClose();
    }
  };

  // Build marked dates object for the calendar
  const getMarkedDates = () => {
    const marked: any = {};

    if (checkInDate) {
      marked[checkInDate] = {
        startingDay: true,
        color: "#007ef2",
        textColor: "#FFFFFF",
      };
    }

    if (checkOutDate) {
      marked[checkOutDate] = {
        endingDay: true,
        color: "#007ef2",
        textColor: "#FFFFFF",
      };
    }

    // Mark dates in between
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const current = new Date(start);
      current.setDate(current.getDate() + 1);

      while (current < end) {
        const dateString = current.toISOString().split("T")[0];
        marked[dateString] = {
          color: "rgba(0, 126, 242, 0.15)",
          textColor: "#101010",
        };
        current.setDate(current.getDate() + 1);
      }
    }

    return marked;
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Dates</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Dates Display */}
          <View style={styles.selectedDatesContainer}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>
                {formatDateDisplay(checkInDate)}
              </Text>
            </View>
            <View style={styles.dateSeparator} />
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <Text style={styles.dateValue}>
                {formatDateDisplay(checkOutDate)}
              </Text>
            </View>
          </View>

          {/* Calendar */}
          <Calendar
            onDayPress={handleDayPress}
            markingType="period"
            markedDates={getMarkedDates()}
            minDate={today}
            theme={{
              backgroundColor: "#FFFFFF",
              calendarBackground: "#FFFFFF",
              textSectionTitleColor: "#101010",
              selectedDayBackgroundColor: "#007ef2",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#007ef2",
              dayTextColor: "#101010",
              textDisabledColor: "#D3D3D3",
              dotColor: "#007ef2",
              selectedDotColor: "#FFFFFF",
              arrowColor: "#101010",
              monthTextColor: "#101010",
              textDayFontFamily: "OpenSans_500Medium",
              textMonthFontFamily: "OpenSans_600SemiBold",
              textDayHeaderFontFamily: "OpenSans_500Medium",
              textDayFontSize: 12,
              textMonthFontSize: 14,
              textDayHeaderFontSize: 12,
            }}
            style={styles.calendar}
          />

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!checkInDate || !checkOutDate) && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!checkInDate || !checkOutDate}
          >
            <Text style={styles.confirmButtonText}>Confirm Dates</Text>
          </TouchableOpacity>
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
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "OpenSans_700Bold",
    color: "#101010",
  },
  closeButton: {
    fontSize: 24,
    color: "#939393",
  },
  selectedDatesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
  },
  dateBox: {
    flex: 1,
  },
  dateSeparator: {
    width: 1,
    height: 40,
    backgroundColor: "#F3F3F3",
    marginHorizontal: 16,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: "OpenSans_400Regular",
    color: "#939393",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontFamily: "OpenSans_700Bold",
    color: "#007ef2",
  },
  calendar: {
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: "#007ef2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#D3D3D3",
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: "OpenSans_700Bold",
    color: "#FFFFFF",
  },
});
