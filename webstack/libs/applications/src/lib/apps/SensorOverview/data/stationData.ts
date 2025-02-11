/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

export type SensorTypes = {
  lat: number;
  lon: number;
  name: string;
  temperatureC: number;
  temperatureF: number;

  soilMoisture: number;
  relativeHumidity: number;
  windSpeed: number;
  solarRadiation: number;
  windDirection: number;
  selected: boolean;
};

// For now, this is hard-coded. Will change when HCDP is ready.
export const stationDataTemplate: SensorTypes[] = [
  {
    lat: 20.8415,
    lon: -156.2948,
    name: '017HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 20.7067,
    lon: -156.3554,
    name: '016HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 20.7579,
    lon: -156.32,
    name: '001HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 20.7598,
    lon: -156.2482,
    name: '002HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 20.7382,
    lon: -156.2458,
    name: '013HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 20.7104,
    lon: -156.2567,
    name: '003HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 19.6974,
    lon: -155.0954,
    name: '005HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 19.964,
    lon: -155.25,
    name: '006HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 19.932,
    lon: -155.291,
    name: '007HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 19.748,
    lon: -155.996,
    name: '008HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 19.803,
    lon: -155.851,
    name: '009HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 19.73,
    lon: -155.87,
    name: '010HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 21.333,
    lon: -157.8025,
    name: '011HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 21.3391,
    lon: -157.8369,
    name: '012HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 22.2026,
    lon: -159.5188,
    name: '014HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
  {
    lat: 22.1975,
    lon: -159.421,
    name: '015HI',
    temperatureC: 0,
    temperatureF: 0,
    soilMoisture: 0,
    relativeHumidity: 0,
    windSpeed: 0,
    solarRadiation: 0,
    windDirection: 0,
    selected: false,
  },
];
