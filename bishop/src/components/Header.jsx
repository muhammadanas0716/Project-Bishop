import { useState } from "react";
import { FiFilter, FiCalendar, FiBarChart2, FiBell } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Header.css";

const Header = () => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const handleDatePickerClick = (e) => {
    e.stopPropagation();
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  const handleDateChange = (update) => {
    setDateRange(update);
    if (update[0] && update[1]) {
      setIsDatePickerOpen(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#0A0A0A", width: "100%" }}>
      <header className="header">
        <div className="header-logo">
          <div className="logo-container">
            <FiBarChart2 size={20} color="#FFFFFF" />
          </div>
          <div className="header-title">Bishop</div>
        </div>

        <div className="header-controls">
          <button className="header-button">
            <FiFilter size={16} />
            Filters
          </button>

          <div className="date-picker-container">
            <button className="header-button" onClick={handleDatePickerClick}>
              <FiCalendar size={16} />
              Date range
            </button>

            {isDatePickerOpen && (
              <div className="date-picker-dropdown">
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                  monthsShown={1}
                  showMonthYearPicker={false}
                  dateFormat="MM/dd/yyyy"
                  className="dark-theme-datepicker"
                />
              </div>
            )}
          </div>

          <button className="header-button">
            <FiBarChart2 size={16} />
            Trades
          </button>

          <button className="icon-button">
            <FiBell size={16} />
          </button>
        </div>
      </header>
    </div>
  );
};

export default Header;
