import RideCard from "@/components/RideCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { AuthContext } from "@/context/AuthContext"
import useFetch from "@/hooks/useFetch"
import axios from "axios"
import { Pencil, Star, Trash } from "lucide-react"
import { Fragment, useContext, useState, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

const apiUri = import.meta.env.VITE_REACT_API_URI

const Profile = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [rideDeleteMode, setRideDeleteMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const { loading, data, refetch } = useFetch(`users/${user.user._id}`, true)

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      bio: "",
      age: "",
      music: "",
      smoking: "",
      petFriendly: "",
    },
  })

  const onSubmit = async (newData) => {
    try {
      await axios.patch(`${apiUri}/users/${user.user._id}`, {
        name: newData.name,
        age: newData.age,
        profile: {
          ...data.profile,
          bio: newData.bio,
          preferences: {
            music: newData.music,
            smoking: newData.smoking,
            petFriendly: newData.petFriendly,
          },
        },
      }, { withCredentials: true })
      refetch()
      reset()
      setEditMode(false)
    } catch (error) {
      console.error('Patch error:', error)
    }
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`${apiUri}/rides/${id}`, { withCredentials: true })
      refetch()
      toast("The ride has been deleted")
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  useEffect(() => {
    if (data) {
      reset({
        name: data.name || "",
        bio: data.profile?.bio || "",
        age: data.age || "",
        music: data.profile?.preferences?.music || "",
        smoking: data.profile?.preferences?.smoking || "",
        petFriendly: data.profile?.preferences?.petFriendly || "",
      })
    }
  }, [data, reset])

  if (!user) return <Navigate to="/" replace />

  return (
    <main className="pb-12 md:py-14 px-6 2xl:px-20 2xl:container 2xl:mx-auto">
      <div className="flex flex-col sm:flex-row h-full w-full">
        <div className="w-full sm:w-96 flex p-0 py-6 md:p-6 xl:p-8 flex-col">
          <div className="relative flex w-full space-x-4 my-8">
            {loading ? (
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ) : (
              <>
                <Avatar>
                  <AvatarImage src={data?.profilePicture} />
                  <AvatarFallback className="select-none text-primary text-xl font-bold">{data?.name[0]}</AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Pencil size={20} className="absolute bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 p-1 cursor-pointer rounded-full bottom-0 -left-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Label htmlFor='avatar' className='font-normal'>Upload image</Label>
                      <Input type="file" id='avatar' className="hidden" />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <p>Remove profile</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex justify-center items-start flex-col space-y-2">
                  <p className="text-base font-semibold leading-4 text-left">{data?.name}</p>
                  <div className="flex items-center text-sm gap-1 text-muted-foreground">
                    <Star fill="yellow" size={20} className="text-transparent" />
                    {data?.stars} - {data?.ratings.length} ratings
                  </div>

                  {/* ✅ Show "KYC Verified" or "Complete KYC" button */}
                  {data?.kycStatus === "verified" ? (
                    <span className="text-green-600 text-sm font-semibold px-2 py-1 bg-green-100 rounded-full">
                      KYC Verified
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate("/kyc")}
                    >
                      Complete KYC
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          {!editMode ? (
            <>
              <Button variant='outline' onClick={() => setEditMode(true)} >Edit Profile</Button>
              <div className="flex justify-center items-start flex-col space-y-4 mt-8">
                <h3 className="text-base font-semibold leading-4 text-center md:text-left">About</h3>
                <p className="text-sm text-muted-foreground">Bio: {data?.profile.bio}</p>
                <p className="text-sm text-muted-foreground">{data?.age && `${data?.age} y/o`}</p>
                <p className="text-sm text-muted-foreground">{data?.ridesCreated.length} Rides published</p>
                <p className="text-sm text-muted-foreground">Member since {data?.createdAt.substring(0, 4)}</p>
              </div>
              <div className="flex justify-center items-start flex-col space-y-4 mt-8">
                <h3 className="text-base font-semibold leading-4 text-center md:text-left">Preferences</h3>
                <p className="text-sm text-muted-foreground">{data?.profile.preferences?.music}</p>
                <p className="text-sm text-muted-foreground">{data?.profile.preferences?.smoking}</p>
                <p className="text-sm text-muted-foreground">{data?.profile.preferences?.petFriendly}</p>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
              <Label htmlFor="name">Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input required autoComplete="name" placeholder="Full name" id="name" {...field} />}
              />
              <Label htmlFor="bio">Bio</Label>
              <Controller
                name="bio"
                control={control}
                render={({ field }) => <Textarea placeholder="Bio" id="bio" {...field} />}
              />
              <Label htmlFor="age">Age</Label>
              <Controller
                name="age"
                control={control}
                render={({ field }) => <Input type="number" placeholder="Age" id="age" {...field} />}
              />
              <Label htmlFor="music">Music Preference</Label>
              <Controller
                name="music"
                control={control}
                render={({ field }) => (
                  <select id="music" {...field} className="border p-2 rounded">
                    <option value="">Select Music Preference</option>
                    <option value="rock">Rock</option>
                    <option value="pop">Pop</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                    <option value="hiphop">Hip-hop</option>
                  </select>
                )}
              />
              <Label htmlFor="smoking">Smoking Preference</Label>
              <Controller
                name="smoking"
                control={control}
                render={({ field }) => (
                  <select id="smoking" {...field} className="border p-2 rounded">
                    <option value="">Select Smoking Preference</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                )}
              />
              <Label htmlFor="petFriendly">Pet Friendly</Label>
              <Controller
                name="petFriendly"
                control={control}
                render={({ field }) => (
                  <select id="petFriendly" {...field} className="border p-2 rounded">
                    <option value="">Select Pet Friendly</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                )}
              />
              <Button type="submit">Save</Button>
              <Button variant='outline' onClick={(e) => { e.preventDefault(); reset(); setEditMode(false) }}>Cancel</Button>
            </form>
          )}
        </div>

        <div className="flex flex-col justify-start items-start gap-2 w-full sm:w-2/3">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-xl font-semibold">Published Rides</h1>
            <Pencil className={`cursor-pointer p-1 rounded-lg ${rideDeleteMode && 'bg-primary text-primary-foreground'} `} size={25} onClick={() => setRideDeleteMode(!rideDeleteMode)} />
          </div>
          <ScrollArea className="h-[275px] w-full rounded-md border p-4">
            {data?.ridesCreated.map(ride =>
              <Fragment key={ride._id} >
                <RideCard details={ride} />
                {rideDeleteMode && <Trash className="text-destructive cursor-pointer" onClick={() => handleDelete(ride._id)} />}
              </Fragment>
            )}
          </ScrollArea>

          <div className="flex mt-5 justify-between items-center w-full">
            <h1 className="text-xl font-semibold">Recently joined rides</h1>
          </div>
          <ScrollArea className="h-[275px] w-full rounded-md border p-4">
            {data?.ridesJoined.map(ride =>
              <Fragment key={ride._id} >
                <RideCard details={ride} />
              </Fragment>
            )}
          </ScrollArea>
        </div>
      </div>
      <Toaster />
    </main>
  )
}

export default Profile
