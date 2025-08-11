import Image from "next/image";

const Logo = () => {
  return (
    <Image
      src="/nexstp-logo.webp"
      alt="Nexstp"
      width={40}
      height={40}
      quality={100}
    />
  );
};

export default Logo;
