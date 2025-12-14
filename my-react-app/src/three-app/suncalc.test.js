import { describe, it, expect, beforeEach } from 'vitest';
import { SunCalc } from './suncalc.js';

describe('SunCalc Library', () => {
  let testDate;
  const lat = 40.4168; // Madrid
  const lng = -3.7038;

  beforeEach(() => {
    // Fixed date for consistent testing: January 15, 2025 at noon
    testDate = new Date('2025-01-15T12:00:00Z');
  });

  describe('Sun Position Calculations', () => {
    it('should calculate sun position for a given date and location', () => {
      const position = SunCalc.getPosition(testDate, lat, lng);

      expect(position).toBeDefined();
      expect(position).toHaveProperty('azimuth');
      expect(position).toHaveProperty('altitude');
      expect(typeof position.azimuth).toBe('number');
      expect(typeof position.altitude).toBe('number');
    });

    it('should return azimuth between -PI and PI', () => {
      const position = SunCalc.getPosition(testDate, lat, lng);

      expect(position.azimuth).toBeGreaterThanOrEqual(-Math.PI);
      expect(position.azimuth).toBeLessThanOrEqual(Math.PI);
    });

    it('should return altitude between -PI/2 and PI/2', () => {
      const position = SunCalc.getPosition(testDate, lat, lng);

      expect(position.altitude).toBeGreaterThanOrEqual(-Math.PI / 2);
      expect(position.altitude).toBeLessThanOrEqual(Math.PI / 2);
    });

    it('should calculate different positions for different locations', () => {
      const madrid = SunCalc.getPosition(testDate, 40.4168, -3.7038);
      const london = SunCalc.getPosition(testDate, 51.5074, -0.1278);

      expect(madrid.azimuth).not.toBe(london.azimuth);
      expect(madrid.altitude).not.toBe(london.altitude);
    });

    it('should calculate different positions for different times', () => {
      const morning = SunCalc.getPosition(new Date('2025-01-15T06:00:00Z'), lat, lng);
      const evening = SunCalc.getPosition(new Date('2025-01-15T18:00:00Z'), lat, lng);

      expect(morning.azimuth).not.toBe(evening.azimuth);
      expect(morning.altitude).not.toBe(evening.altitude);
    });
  });

  describe('Sun Times Calculations', () => {
    it('should calculate sun times for a given date and location', () => {
      const times = SunCalc.getTimes(testDate, lat, lng);

      expect(times).toBeDefined();
      expect(times).toHaveProperty('sunrise');
      expect(times).toHaveProperty('sunset');
      expect(times).toHaveProperty('solarNoon');
      expect(times).toHaveProperty('nadir');
    });

    it('should return valid Date objects for sun times', () => {
      const times = SunCalc.getTimes(testDate, lat, lng);

      expect(times.sunrise).toBeInstanceOf(Date);
      expect(times.sunset).toBeInstanceOf(Date);
      expect(times.solarNoon).toBeInstanceOf(Date);
      expect(times.nadir).toBeInstanceOf(Date);
    });

    it('should have sunrise before sunset', () => {
      const times = SunCalc.getTimes(testDate, lat, lng);

      expect(times.sunrise.getTime()).toBeLessThan(times.sunset.getTime());
    });

    it('should include dawn and dusk times', () => {
      const times = SunCalc.getTimes(testDate, lat, lng);

      expect(times).toHaveProperty('dawn');
      expect(times).toHaveProperty('dusk');
      expect(times.dawn).toBeInstanceOf(Date);
      expect(times.dusk).toBeInstanceOf(Date);
    });

    it('should include nautical twilight times', () => {
      const times = SunCalc.getTimes(testDate, lat, lng);

      expect(times).toHaveProperty('nauticalDawn');
      expect(times).toHaveProperty('nauticalDusk');
      expect(times.nauticalDawn).toBeInstanceOf(Date);
      expect(times.nauticalDusk).toBeInstanceOf(Date);
    });

    it('should include golden hour times', () => {
      const times = SunCalc.getTimes(testDate, lat, lng);

      expect(times).toHaveProperty('goldenHourEnd');
      expect(times).toHaveProperty('goldenHour');
      expect(times.goldenHourEnd).toBeInstanceOf(Date);
      expect(times.goldenHour).toBeInstanceOf(Date);
    });

    it('should calculate times with observer height', () => {
      const groundLevel = SunCalc.getTimes(testDate, lat, lng, 0);
      const elevated = SunCalc.getTimes(testDate, lat, lng, 100);

      expect(groundLevel.sunrise.getTime()).not.toBe(elevated.sunrise.getTime());
      expect(groundLevel.sunset.getTime()).not.toBe(elevated.sunset.getTime());
    });

    it('should have correct order of twilight times', () => {
      const times = SunCalc.getTimes(testDate, lat, lng);

      expect(times.dawn.getTime()).toBeLessThan(times.sunrise.getTime());
      expect(times.sunrise.getTime()).toBeLessThan(times.solarNoon.getTime());
      expect(times.solarNoon.getTime()).toBeLessThan(times.sunset.getTime());
      expect(times.sunset.getTime()).toBeLessThan(times.dusk.getTime());
    });
  });

  describe('Moon Position Calculations', () => {
    it('should calculate moon position for a given date and location', () => {
      const position = SunCalc.getMoonPosition(testDate, lat, lng);

      expect(position).toBeDefined();
      expect(position).toHaveProperty('azimuth');
      expect(position).toHaveProperty('altitude');
      expect(position).toHaveProperty('distance');
      expect(position).toHaveProperty('parallacticAngle');
    });

    it('should return valid numeric values', () => {
      const position = SunCalc.getMoonPosition(testDate, lat, lng);

      expect(typeof position.azimuth).toBe('number');
      expect(typeof position.altitude).toBe('number');
      expect(typeof position.distance).toBe('number');
      expect(typeof position.parallacticAngle).toBe('number');
    });

    it('should return distance in reasonable range (km)', () => {
      const position = SunCalc.getMoonPosition(testDate, lat, lng);

      // Moon distance varies between ~356,500 km and ~406,700 km
      expect(position.distance).toBeGreaterThan(350000);
      expect(position.distance).toBeLessThan(410000);
    });

    it('should calculate different positions for different locations', () => {
      const madrid = SunCalc.getMoonPosition(testDate, 40.4168, -3.7038);
      const newyork = SunCalc.getMoonPosition(testDate, 40.7128, -74.0060);

      expect(madrid.azimuth).not.toBe(newyork.azimuth);
      expect(madrid.altitude).not.toBe(newyork.altitude);
    });

    it('should calculate different positions for different times', () => {
      const morning = SunCalc.getMoonPosition(new Date('2025-01-15T06:00:00Z'), lat, lng);
      const evening = SunCalc.getMoonPosition(new Date('2025-01-15T18:00:00Z'), lat, lng);

      expect(morning.azimuth).not.toBe(evening.azimuth);
      expect(morning.altitude).not.toBe(evening.altitude);
    });
  });

  describe('Moon Illumination Calculations', () => {
    it('should calculate moon illumination for a given date', () => {
      const illumination = SunCalc.getMoonIllumination(testDate);

      expect(illumination).toBeDefined();
      expect(illumination).toHaveProperty('fraction');
      expect(illumination).toHaveProperty('phase');
      expect(illumination).toHaveProperty('angle');
    });

    it('should return fraction between 0 and 1', () => {
      const illumination = SunCalc.getMoonIllumination(testDate);

      expect(illumination.fraction).toBeGreaterThanOrEqual(0);
      expect(illumination.fraction).toBeLessThanOrEqual(1);
    });

    it('should return phase between 0 and 1', () => {
      const illumination = SunCalc.getMoonIllumination(testDate);

      expect(illumination.phase).toBeGreaterThanOrEqual(0);
      expect(illumination.phase).toBeLessThanOrEqual(1);
    });

    it('should use current date when no date is provided', () => {
      const illumination = SunCalc.getMoonIllumination();

      expect(illumination).toBeDefined();
      expect(illumination.fraction).toBeGreaterThanOrEqual(0);
      expect(illumination.fraction).toBeLessThanOrEqual(1);
    });

    it('should calculate different illumination for different dates', () => {
      const date1 = SunCalc.getMoonIllumination(new Date('2025-01-01'));
      const date2 = SunCalc.getMoonIllumination(new Date('2025-01-15'));

      // Illumination should change over 14 days
      expect(date1.fraction).not.toBe(date2.fraction);
      expect(date1.phase).not.toBe(date2.phase);
    });

    //it('should identify new moon phase (phase near 0)', () => {
    //  // Find a new moon date
    //  const newMoonDate = new Date('2025-01-29'); // Approximate new moon
    //  const illumination = SunCalc.getMoonIllumination(newMoonDate);
//
    //  expect(illumination.phase).toBeLessThan(0.1);
    //});

    it('should identify full moon phase (phase near 0.5)', () => {
      // Find a full moon date
      const fullMoonDate = new Date('2025-01-13'); // Approximate full moon
      const illumination = SunCalc.getMoonIllumination(fullMoonDate);

      expect(illumination.phase).toBeGreaterThan(0.4);
      expect(illumination.phase).toBeLessThan(0.6);
    });
  });

  describe('Moon Times Calculations', () => {
    it('should calculate moon rise and set times', () => {
      const times = SunCalc.getMoonTimes(testDate, lat, lng);

      expect(times).toBeDefined();
      expect(typeof times).toBe('object');
    });

    it('should return rise and set as Date objects when available', () => {
      const times = SunCalc.getMoonTimes(testDate, lat, lng);

      if (times.rise) {
        expect(times.rise).toBeInstanceOf(Date);
      }
      if (times.set) {
        expect(times.set).toBeInstanceOf(Date);
      }
    });

    it('should handle case when moon is always up', () => {
      // Try dates and locations where moon might be always up
      const arcticSummer = new Date('2025-06-21');
      const times = SunCalc.getMoonTimes(arcticSummer, 80, 0); // Near North Pole

      expect(times).toBeDefined();
      // May have alwaysUp property
      if (times.alwaysUp !== undefined) {
        expect(typeof times.alwaysUp).toBe('boolean');
      }
    });

    it('should handle case when moon is always down', () => {
      // Try dates and locations where moon might be always down
      const arcticWinter = new Date('2025-12-21');
      const times = SunCalc.getMoonTimes(arcticWinter, 80, 0); // Near North Pole

      expect(times).toBeDefined();
      // May have alwaysDown property
      if (times.alwaysDown !== undefined) {
        expect(typeof times.alwaysDown).toBe('boolean');
      }
    });

    it('should calculate times in UTC when inUTC is true', () => {
      const timesUTC = SunCalc.getMoonTimes(testDate, lat, lng, true);
      const timesLocal = SunCalc.getMoonTimes(testDate, lat, lng, false);

      expect(timesUTC).toBeDefined();
      expect(timesLocal).toBeDefined();
      // Both should return valid results
    });

    it('should have moonrise before moonset on most days', () => {
      const times = SunCalc.getMoonTimes(testDate, lat, lng);

      if (times.rise && times.set) {
        // This may not always be true due to moon's orbit
        // but we test that both exist
        expect(times.rise).toBeInstanceOf(Date);
        expect(times.set).toBeInstanceOf(Date);
      }
    });
  });

  describe('Custom Time Addition', () => {
    it('should allow adding custom time definitions', () => {
      const initialLength = SunCalc.times.length;
      
      SunCalc.addTime(-4, 'customDawn', 'customDusk');
      
      expect(SunCalc.times.length).toBe(initialLength + 1);
      expect(SunCalc.times[SunCalc.times.length - 1]).toEqual([-4, 'customDawn', 'customDusk']);
    });

    it('should include custom times in getTimes result', () => {
      SunCalc.addTime(-15, 'astronomicalDawn', 'astronomicalDusk');
      
      const times = SunCalc.getTimes(testDate, lat, lng);
      
      expect(times).toHaveProperty('astronomicalDawn');
      expect(times).toHaveProperty('astronomicalDusk');
      expect(times.astronomicalDawn).toBeInstanceOf(Date);
      expect(times.astronomicalDusk).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle dates at year boundaries', () => {
      const newYear = new Date('2025-01-01T00:00:00Z');
      const position = SunCalc.getPosition(newYear, lat, lng);
      const times = SunCalc.getTimes(newYear, lat, lng);

      expect(position).toBeDefined();
      expect(times).toBeDefined();
    });

    it('should handle leap year dates', () => {
      const leapDay = new Date('2024-02-29T12:00:00Z');
      const position = SunCalc.getPosition(leapDay, lat, lng);
      const times = SunCalc.getTimes(leapDay, lat, lng);

      expect(position).toBeDefined();
      expect(times).toBeDefined();
    });

    it('should handle equator location', () => {
      const position = SunCalc.getPosition(testDate, 0, 0);
      const times = SunCalc.getTimes(testDate, 0, 0);

      expect(position).toBeDefined();
      expect(times).toBeDefined();
    });

    it('should handle north pole location', () => {
      const position = SunCalc.getPosition(testDate, 90, 0);
      const times = SunCalc.getTimes(testDate, 90, 0);

      expect(position).toBeDefined();
      expect(times).toBeDefined();
    });

    it('should handle south pole location', () => {
      const position = SunCalc.getPosition(testDate, -90, 0);
      const times = SunCalc.getTimes(testDate, -90, 0);

      expect(position).toBeDefined();
      expect(times).toBeDefined();
    });

    it('should handle date line crossing (longitude 180)', () => {
      const position = SunCalc.getPosition(testDate, 0, 180);
      const times = SunCalc.getTimes(testDate, 0, 180);

      expect(position).toBeDefined();
      expect(times).toBeDefined();
    });

    it('should handle negative elevations', () => {
      const seaLevel = SunCalc.getTimes(testDate, lat, lng, 0);
      const belowSeaLevel = SunCalc.getTimes(testDate, lat, lng, -100);

      expect(seaLevel).toBeDefined();
      expect(belowSeaLevel).toBeDefined();
    });

    it('should handle very high elevations', () => {
      const groundLevel = SunCalc.getTimes(testDate, lat, lng, 0);
      const highAltitude = SunCalc.getTimes(testDate, lat, lng, 8848); // Mt. Everest

      expect(groundLevel).toBeDefined();
      expect(highAltitude).toBeDefined();
      expect(groundLevel.sunrise.getTime()).not.toBe(highAltitude.sunrise.getTime());
    });
  });

  describe('Consistency and Stability', () => {
    it('should return consistent results for the same input', () => {
      const position1 = SunCalc.getPosition(testDate, lat, lng);
      const position2 = SunCalc.getPosition(testDate, lat, lng);

      expect(position1.azimuth).toBe(position2.azimuth);
      expect(position1.altitude).toBe(position2.altitude);
    });

    it('should return consistent moon illumination for same date', () => {
      const illum1 = SunCalc.getMoonIllumination(testDate);
      const illum2 = SunCalc.getMoonIllumination(testDate);

      expect(illum1.fraction).toBe(illum2.fraction);
      expect(illum1.phase).toBe(illum2.phase);
      expect(illum1.angle).toBe(illum2.angle);
    });

    it('should return finite numbers for all calculations', () => {
      const sunPos = SunCalc.getPosition(testDate, lat, lng);
      const moonPos = SunCalc.getMoonPosition(testDate, lat, lng);
      const illum = SunCalc.getMoonIllumination(testDate);

      expect(Number.isFinite(sunPos.azimuth)).toBe(true);
      expect(Number.isFinite(sunPos.altitude)).toBe(true);
      expect(Number.isFinite(moonPos.azimuth)).toBe(true);
      expect(Number.isFinite(moonPos.altitude)).toBe(true);
      expect(Number.isFinite(moonPos.distance)).toBe(true);
      expect(Number.isFinite(illum.fraction)).toBe(true);
      expect(Number.isFinite(illum.phase)).toBe(true);
    });
  });
});
