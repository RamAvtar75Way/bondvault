export type ProfileMenuItemProps = {
  icon: string;
  label: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  color?: string;
  value?: string;
  showChevron?: boolean;
};
