"use client";

import { BusinessProfileTabs } from "./business-profile/BusinessProfileTabs";

interface BusinessProfileFormProps {
  userId: string;
}

export default function BusinessProfileForm({
  userId,
}: BusinessProfileFormProps) {
  return <BusinessProfileTabs userId={userId} />;
}
