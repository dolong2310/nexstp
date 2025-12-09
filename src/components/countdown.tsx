"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string; // ISO 8601 format: 'YYYY-MM-DDTHH:mm:ss.sssZ'
  isExpired?: boolean;
  expiredContent?: React.ReactNode;
}

const getDaysText = (days: number) => {
  if (days === 0) return "";
  if (days === 1) return "1 day";
  return `${days} days`;
};

const formatDigits = (time: number) => {
  const formatted = String(time).padStart(2, "0");
  return {
    tens: formatted[0],
    units: formatted[1],
  };
};

const calculateTimeLeft = (targetDate: string) => {
  // Parse ISO 8601 date string
  const targetTime = new Date(targetDate).getTime();
  const currentTime = new Date().getTime();
  const difference = targetTime - currentTime;

  let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  isExpired,
  expiredContent,
}) => {
  const t = useTranslations();
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
  const [prevTimeLeft, setPrevTimeLeft] = useState(
    calculateTimeLeft(targetDate)
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevTimeLeft(timeLeft);
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, targetDate]);

  const renderTimeUnit = (current: number, previous: number, unit: string) => {
    const currentDigits = formatDigits(current);
    const previousDigits = formatDigits(previous);

    return (
      <div className="flex items-center" key={unit}>
        {/* Chữ số hàng chục */}
        <div className="relative overflow-hidden">
          <div
            key={
              currentDigits.tens !== previousDigits.tens
                ? `${unit}-tens-${currentDigits.tens}`
                : `${unit}-tens-static`
            }
            className={cn(
              currentDigits.tens !== previousDigits.tens && "animate-slide-down"
            )}
          >
            {currentDigits.tens}
          </div>
        </div>

        {/* Chữ số hàng đơn vị */}
        <div className="relative overflow-hidden">
          <div
            key={
              currentDigits.units !== previousDigits.units
                ? `${unit}-units-${currentDigits.units}`
                : `${unit}-units-static`
            }
            className={cn(
              currentDigits.units !== previousDigits.units &&
                "animate-slide-down"
            )}
          >
            {currentDigits.units}
          </div>
        </div>
      </div>
    );
  };

  if (!isMounted) return <span>00 : 00 : 00</span>;

  const isExpiredTime = new Date(targetDate).getTime() <= new Date().getTime();

  if (isExpired && isExpiredTime) {
    return expiredContent ? (
      <div>{expiredContent}</div>
    ) : (
      <div className="flex items-center justify-center">
        <span className="">{t("End time")}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {/* Day */}
      {timeLeft.days > 0 && (
        <>
          <span>{timeLeft.days}</span>
          <span>:</span>
        </>
      )}

      {/* Hour */}
      {renderTimeUnit(timeLeft.hours, prevTimeLeft.hours, "hours")}
      <span>:</span>

      {/* Minute */}
      {renderTimeUnit(timeLeft.minutes, prevTimeLeft.minutes, "minutes")}
      <span>:</span>

      {/* Second */}
      {renderTimeUnit(timeLeft.seconds, prevTimeLeft.seconds, "seconds")}
    </div>
  );
};

export default Countdown;
