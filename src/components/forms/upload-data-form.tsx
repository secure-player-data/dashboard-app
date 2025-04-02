import type React from 'react';
import { useRef, useState } from 'react';
import TipTap from '../text-editor/tiptap';
import { Button, ButtonWithLoader } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Info, PlusCircle, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useGetMembers } from '@/use-cases/use-get-members';
import { useGetResourceList } from '@/use-cases/use-get-resource-list';
import { toast } from 'sonner';
import { useGetProfile } from '@/use-cases/profile';
import { useUploadData } from '@/use-cases/use-upload-data';
import { z } from 'zod';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

type DataEntry = {
  id: string;
  type: 'file' | 'text';
  content: string;
  fileName?: string;
};

const formSchema = z
  .object({
    dataType: z.string().min(2, 'Need to select a datatype'),
    player: z.string().min(2, 'Need to select a player'),
    reason: z.string().min(2, 'Need to give a reason for the data collection'),
    location: z.string().min(2, 'Need to specify the location of the data'),
    files: z.array(z.any()).min(1, 'At least one file must be uploaded'),
    hasTextEntry: z.boolean(),
    textName: z.string(),
    textContent: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.hasTextEntry) {
      if (data.textName.length < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['textName'],
          message: 'Need to give a name to the text file',
        });
      }
      if (data.textContent.length < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['textContent'],
          message: 'Text content of the text file must be at least 1 character',
        });
      }
    }
  });

type FormSchema = z.infer<typeof formSchema>;

type ErrorState = Partial<Record<keyof FormSchema, string>>;

export default function UploadDataForm() {
  const [dataType, setDataType] = useState<string>('');
  const [player, setPlayer] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [textName, setTextName] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [hasTextEntry, setHasTextEntry] = useState<boolean>(false);

  const [errors, setErrors] = useState<ErrorState>({});

  const { session, pod } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: members } = useGetMembers(session, pod);

  const { data: resourceList } = useGetResourceList(session, pod);

  const { data: profile } = useGetProfile(session, pod);

  const uploadPlayerData = useUploadData(session);

  const resetForm = () => {
    setDataEntries([]);
    setUploadedFiles([]);
    setTextContent('');
    setHasTextEntry(false);
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

      return [...prevFiles, ...newFiles];
    });

    setDataEntries((prevEntries) => {
      const newEntries = files
        .filter(
          (file) => !prevEntries.some((entry) => entry.fileName === file.name)
        )
        .map((file) => ({
          id: Date.now().toString(),
          type: 'file' as const,
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
  };

  const removeEntry = (id: string) => {
    const entryToRemove = dataEntries.find((entry) => entry.id === id);
    if (entryToRemove?.type === 'text') {
      setHasTextEntry(false);
      setTextName('');
      setTextContent('');
    }
    setDataEntries(dataEntries.filter((entry) => entry.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!session || !session.info.webId || !profile || !profile.name || !pod) {
      toast.error('Authentication failed, please log out and back in again.');
      return;
    }

    if (!members) {
      toast.error('No members available');
      return;
    }

    const validation = formSchema.safeParse({
      dataType,
      player,
      reason,
      location,
      files: dataEntries,
      hasTextEntry,
      textName,
      textContent,
    });

    if (!validation.success) {
      const newErrors: { [key: string]: string | null } = {};
      validation.error.errors.forEach((error) => {
        newErrors[error.path[0]] = error.message;
      });
      setErrors(newErrors);
      return;
    }

    const member = members.find((member) => member.name == player);
    if (!member) {
      toast.error('Player not found');
      return;
    }
    const playerPod = member.pod;

    // Create html file from text input
    let file: File | undefined;
    if (hasTextEntry) {
      file = new File([textContent], `${textName}.html`, {
        type: 'text/html',
      });
    }

    uploadPlayerData.mutate(
      {
        session: session,
        uploadedFile: file ? [...uploadedFiles, file] : uploadedFiles,
        senderPod: pod,
        uploader: { webId: session.info.webId, name: profile.name },
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
      <CardHeader>
        <CardTitle>Player Data Collection Report</CardTitle>
        <CardDescription>Submit data recorded of a player</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="data-type">
                Data type <span className="text-destructive">*</span>
              </Label>
              <Select value={dataType} onValueChange={setDataType} required>
                <SelectTrigger
                  id="data-type"
                  className={errors.dataType && 'border-destructive'}
                >
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                {showResourceList()}
              </Select>
              {errors.dataType && (
                <p className="text-sm text-destructive">{errors.dataType}</p>
              )}
            </div>

            <div>
              <Label htmlFor="player">
                Player <span className="text-destructive">*</span>
              </Label>
              <Select value={player} onValueChange={setPlayer} required>
                <SelectTrigger
                  id="player"
                  className={errors.player && 'border-destructive'}
                >
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                {showMemberList()}
              </Select>
              {errors.player && (
                <p className="text-sm text-destructive">{errors.player}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="reason">
              Reason <span className="text-destructive">*</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="sm">
                      <Info className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="font-normal">
                    <p className="text-sm max-w-[50ch]">
                      Please provide a clear and specific reason for collecting
                      this data. According to{' '}
                      <strong>GDPR Article 5.1(b)</strong>, data collection must
                      have a legitimate purpose. Ensure that your reason aligns
                      with compliance requirements and justifies why this data
                      is necessary.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain why this data is being collected..."
              className={`min-h-[80px] ${errors.reason && 'border-destructive'}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason}</p>
            )}
          </div>

          <div className="mb-4">
            <Label htmlFor="location">
              Location <span className="text-destructive">*</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="sm">
                      <Info className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="font-normal">
                    <p className="mb-1">
                      Enter the location of the origin of the data so that it
                      can be referenced later.
                    </p>
                    <p>E.g. when a player wants the data deleted.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="location"
              placeholder="Application > Player > Training > date"
              className={errors.location && 'border-destructive'}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location}</p>
            )}
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center">
              <Label>
                Files <span className="text-destructive">*</span>
              </Label>
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
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    multiple
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            </div>
            {errors.files && (
              <p className="text-sm text-destructive mb-2">{errors.files}</p>
            )}

            {hasTextEntry && (
              <div>
                <div className="mb-4">
                  <Label htmlFor="text-name">
                    File name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="text-name"
                    value={textName}
                    onChange={(e) => setTextName(e.target.value)}
                    placeholder="tracking_data_001"
                  />
                  <p className="text-sm text-muted-foreground">
                    A name to identify the file created with the content in the
                    text editor below
                  </p>
                  {errors.textName && (
                    <p className="text-sm text-destructive">
                      {errors.textName}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <Label>
                    File content <span className="text-destructive">*</span>
                  </Label>
                  <div className="p-1 border rounded-md">
                    <TipTap onChange={updateTextEntry} />
                  </div>
                  {errors.textContent && (
                    <p className="text-sm text-destructive">
                      {errors.textContent}
                    </p>
                  )}
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
                  dataEntries.map((entry, index) => (
                    <TableRow key={entry.id + index}>
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
            <ButtonWithLoader
              isLoading={uploadPlayerData.isPending}
              type="submit"
            >
              Submit Report
            </ButtonWithLoader>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
