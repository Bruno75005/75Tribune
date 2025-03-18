import { PublishDestination } from '@/services/publishers/types';
import { Switch } from './ui/switch';
import Label from './ui/label';

interface PublishDestinationsProps {
  destinations: PublishDestination[];
  onChange: (platform: string) => void;
}

export function PublishDestinations({ destinations, onChange }: PublishDestinationsProps) {
  return (
    <div>
      <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
        Plateformes de publication
      </Label>
      <div className="flex flex-row gap-4">
        {destinations.map((dest) => (
          <div
            key={dest.platform}
            className="flex-1 flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
              {dest.platform}
            </span>
            <Switch
              checked={dest.enabled}
              onCheckedChange={() => onChange(dest.platform)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
