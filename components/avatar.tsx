import Image from "next/image";

type Props = {
  name: string;
  pictureUrl: string | null;
  size?: number;
};

export default function Avatar({ name, pictureUrl, size = 40 }: Props) {
  if (pictureUrl) {
    return (
      <Image
        src={pictureUrl}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-gray-300 font-medium text-gray-700"
      style={{ width: size, height: size }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
