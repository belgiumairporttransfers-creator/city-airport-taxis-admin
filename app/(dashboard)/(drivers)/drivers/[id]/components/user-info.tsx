import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Location, Calender, Mail } from "@/components/svg";
import type { DriverApplication } from "@/lib/schemas";

interface UserInfoItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));

type UserInfoProps = {
  driver: DriverApplication;
};

const UserInfo = ({ driver }: UserInfoProps) => {
  const userInfo: UserInfoItem[] = [
    {
      icon: User,
      label: "Full Name",
      value: `${driver.firstName} ${driver.lastName}`,
    },
    {
      icon: Phone,
      label: "Mobile",
      value: driver.phone,
    },
    {
      icon: Mail,
      label: "Email",
      value: driver.email,
    },
    {
      icon: Location,
      label: "Location",
      value: `${driver.operatingCity}, ${driver.operatingCountry}`,
    },
    {
      icon: Location,
      label: "Address",
      value: driver.homeAddress,
    },
    {
      icon: Calender,
      label: "Applied On",
      value: formatDate(driver.createdAt),
    },
    {
      icon: Calender,
      label: "Experience",
      value: `${driver.yearsOfExperience} years`,
    },
  ];

  return (
    <Card>
      <CardHeader className="mb-0 border-none">
        <CardTitle className="text-lg font-medium text-default-800">Information</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <ul className="space-y-4">
          {userInfo.map((item, index) => (
            <li key={`user-info-${index}`} className="flex items-center">
              <div className="flex flex-none items-center gap-1.5 2xl:w-56">
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-default-800">{item.label}:</span>
              </div>
              <div className="flex-1 text-sm text-default-700">{item.value}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default UserInfo;
