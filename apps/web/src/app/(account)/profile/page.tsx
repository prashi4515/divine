import type { Metadata } from "next";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardContent className="flex items-center gap-4 py-6">
          <Avatar name="Guest Reader" size="lg" />
          <div>
            <p className="font-serif text-xl tracking-tight">Guest Reader</p>
            <p className="text-muted-foreground text-sm">
              Sign in to personalize your profile.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Reading experience defaults.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Preferred language" value="English" />
          <Row label="Theme" value="System" />
          <Row label="Font size" value="Comfortable" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journey</CardTitle>
          <CardDescription>Your reading milestones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Reading streak" value="—" />
          <Row
            label="Achievements"
            value={<Badge variant="muted">Coming soon</Badge>}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
