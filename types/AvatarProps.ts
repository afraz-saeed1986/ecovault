export interface AvatarProps {
  image?: string | null;
  name?: string | null;
  // size: w-16 h-16 sm:w-20 sm:h-20
  size: string; 
  // dashboardSize: 'w-16 h-16 sm:w-20 sm:h-20'
  scale: "small" | "large";
}