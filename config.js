/*
    STATION CONFIGURATION FILE
*/

// Ground station emplacement
var gs_latitude = 0.000000; // latitude
var gs_longitude = 0.000000; // longitude
var gs_asl = 0; // Altitude above sea level

// file path
var tle_path = "https://www.celestrak.com/NORAD/elements/weather.txt"; // path to .txt file or link to TLE file
var path_cmd_file = "path/to/launch_convert_image.sh"; // path to the bash file
var record_folder = "path/to/record/folder/";

// Satellite
var nb_satellites = 3; //Number of satellites
var target = [25338, 28654, 33591]; // NORAD number of the target (NOAA15, NOAA18, NOAA19)
var frequency_sat = [137.620e6, 137.9125e6, 137.100e6]; //Sat frequency in Hz (NOAA15, NOAA18, NOAA19)

// RTLSDR
var rtl_gain = 1.4; // rtlsdr gain

// Print in terminal
var print_passes = true; // print list of future passes true or false
var print_debug = true; //Print debug in terminal true or false
