import type React from 'react';
import { useState } from 'react';
import TipTap from '../text-editor/tiptap';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useGetMembers } from '@/use-cases/use-get-members';
import { useGetResourceList } from '@/use-cases/use-get-resource-list';
import { toast } from 'sonner';
import { useGetProfile } from '@/use-cases/profile';
import { useUploadData } from '@/use-cases/use-upload-data';

type DataEntry = {
  id: string;
  type: 'file' | 'text';
  content: string;
  fileName?: string;
};

export default function UploadDataForm() {
  const [dataType, setDataType] = useState<string>('');
  const [player, setPlayer] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [textContent, setTextContent] = useState<string>('');
  const [hasTextEntry, setHasTextEntry] = useState<boolean>(false);
  const { session, pod } = useAuth();

  const { data: members } = useGetMembers(session, pod);

  const { data: resourceList } = useGetResourceList(session, pod);

  const { data: profile } = useGetProfile(session, pod);

  const uploadPlayerData = useUploadData(session, pod);

  const resetForm = () => {
    setDataEntries([]);
    setUploadedFiles([]);
    setTextContent('');
    setDataType('');
    setReason('');
    setLocation('');
    setPlayer('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setUploadedFiles((prevFiles) => {
      const newFiles = files.filter(
        (file) =>
          !prevFiles.some(
            (existingFile) =>
              existingFile.name === file.name && existingFile.size === file.size
          )
      );

      console.log('New unique files:', newFiles);
      return [...prevFiles, ...newFiles];
    });

    setDataEntries((prevEntries) => {
      const newEntries = files
        .filter(
          (file) => !prevEntries.some((entry) => entry.fileName === file.name)
        )
        .map((file) => ({
          id: Date.now().toString(),
          type: 'file' as 'file',
          content: URL.createObjectURL(file),
          fileName: file.name,
        }));

      return [...prevEntries, ...newEntries];
    });

    e.target.value = '';
  };

  const addTextEntry = () => {
    if (!hasTextEntry) {
      const newEntry: DataEntry = {
        id: Date.now().toString(),
        type: 'text',
        content: textContent,
      };
      setDataEntries([...dataEntries, newEntry]);
      setHasTextEntry(true);
    }
  };

  const updateTextEntry = (content: string) => {
    setTextContent(content);
    setDataEntries(
      dataEntries.map((entry) =>
        entry.type === 'text' ? { ...entry, content } : entry
      )
    );
  };

  const removeEntry = (id: string) => {
    const entryToRemove = dataEntries.find((entry) => entry.id === id);
    if (entryToRemove?.type === 'text') {
      setHasTextEntry(false);
      setTextContent('');
    }
    setDataEntries(dataEntries.filter((entry) => entry.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let playerPod = '';

    if (members) {
      const member = members.filter((member) => member.name == player);
      playerPod = member[0].pod;
    }

    if (!session || !pod) {
      throw new Error('Missing pod or session');
    }

    uploadPlayerData.mutate(
      {
        session: session,
        uploadedFile: uploadedFiles,
        senderPod: pod,
        uploader: { webId: session?.info.webId!, name: profile?.name! },
        reason: reason,
        location: location,
        category: dataType,
        receiverPod: playerPod,
      },
      {
        onError: (error) => {
          toast.error(`An error occured: ${error.message}`);
        },
        onSuccess: () => {
          resetForm();
          toast('Form submitted successfully!');
        },
      }
    );
  };

  const showMemberList = () => {
    if (!members) {
      return <div>Could not fetch members</div>;
    }

    return (
      <SelectContent>
        {members.map((member) => (
          <SelectItem key={member.webId} value={member.name}>
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    );
  };

  const showResourceList = () => {
    if (!resourceList) {
      return <div>Could not fetch members</div>;
    }

    const filteredResources = resourceList.filter((resource) => {
      if (resource.type == 'folder' && resource.path.includes('data'))
        return resource;
    });

    return (
      <SelectContent>
        {filteredResources.map((resource) => (
          <SelectItem key={resource.path} value={resource.path}>
            {resource.path.replace('-', ' ').replace('/', '')}
          </SelectItem>
        ))}
      </SelectContent>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold mb-6">
            Player Data Collection Report
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="data-type">Type of Data Collected</Label>
              <Select value={dataType} onValueChange={setDataType} required>
                <SelectTrigger id="data-type">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                {showResourceList()}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="player">Player</Label>
              <Select value={player} onValueChange={setPlayer} required>
                <SelectTrigger id="player">
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                {showMemberList()}
              </Select>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Label htmlFor="reason">Reason for Data Collection</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this data is being collected..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2 mb-6">
            <Label htmlFor="location">Location of Collected Data</Label>
            <Input
              id="location"
              placeholder="Application > Player > Training > date"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center mb-2">
              <Label>Collected Data</Label>
              <div className="flex gap-2">
                {!hasTextEntry && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTextEntry}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Text Entry
                  </Button>
                )}
                <div className="relative">
                  <Input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    multiple
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            </div>

            {hasTextEntry && (
              <div className="mb-4 border rounded-md">
                <div className="p-1">
                  {<TipTap callback={updateTextEntry()} />}
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-full">Content</TableHead>
                  <TableHead className="w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataEntries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-6"
                    >
                      No data entries yet. Add text or upload files.
                    </TableCell>
                  </TableRow>
                ) : (
                  dataEntries.map((entry) => (
                    <TableRow key={entry.fileName}>
                      <TableCell>
                        {entry.type === 'file' ? 'File' : 'Text'}
                      </TableCell>
                      <TableCell>
                        {entry.type === 'file' ? (
                          <span className="text-sm">{entry.fileName}</span>
                        ) : (
                          <div className="text-sm">
                            Text from the text editor above is added
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Submit Report</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
