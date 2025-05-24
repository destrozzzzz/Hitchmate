import RideCard from "@/components/RideCard"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const preferenceOptions = {
  music: ["rock", "pop", "jazz", "classical", "hiphop"],
  smoking: ["yes", "no"],
  petFriendly: ["yes", "no"],
}

const Profile = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [rideDeleteMode, setRideDeleteMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const { loading, data, refetch } = useFetch(`users/${user?._id}`, true)

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

  const onSubmit = async (formData) => {
    if (!user?._id) {
      toast.error("User ID not found!")
      return
    }

    try {
      await axios.patch(
        `${apiUri}/users/${user._id}`,
        {
          name: formData.name,
          age: formData.age,
          profile: {
            ...data.profile,
            bio: formData.bio,
            preferences: {
              music: formData.music,
              smoking: formData.smoking,
              petFriendly: formData.petFriendly,
            },
          },
        },
        { withCredentials: true }
      )
      toast.success("Profile updated!")
      refetch()
      setEditMode(false)
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Update failed!")
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUri}/rides/${id}`, { withCredentials: true })
      refetch()
      toast("Ride deleted.")
    } catch (err) {
      console.error("Delete error:", err)
      toast.error("Error deleting ride.")
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setAvatarPreview(URL.createObjectURL(file))
    const formData = new FormData()
    formData.append("avatar", file)

    try {
      await axios.patch(`${apiUri}/users/${user._id}/avatar`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Profile picture updated!")
      refetch()
    } catch (err) {
      console.error("Avatar upload error:", err)
      toast.error("Failed to upload profile picture.")
    }
  }

  if (!user) return <Navigate to="/" replace />

  return (
    <main className="pb-12 md:py-14 px-6 2xl:px-20 2xl:container 2xl:mx-auto">
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full sm:w-96 flex flex-col py-6 md:p-6 xl:p-8 border rounded-lg">
          <div className="relative flex w-full space-x-4 my-8 items-center">
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
                <Avatar className="w-14 h-14">
                  <AvatarImage src={avatarPreview || data?.profilePicture} />
                  <AvatarFallback>{data?.name[0]}</AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Pencil className="absolute bottom-0 -left-5 p-1 cursor-pointer rounded-full bg-background/95 backdrop-blur-sm" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Label htmlFor="avatar" className="cursor-pointer font-normal">
                        Upload image
                      </Label>
                      <Input type="file" id="avatar" className="hidden" onChange={handleAvatarUpload} />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <p className="text-red-500">Remove profile (coming soon)</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div>
                  <p className="text-base font-semibold">{data?.name}</p>
                  <div className="flex items-center text-sm gap-1 text-muted-foreground">
                    <Star fill="yellow" size={20} className="text-yellow-400" />
                    {data?.stars} - {data?.ratings.length} ratings
                  </div>
                  {data?.kycStatus === "verified" ? (
                    <span className="text-green-600 text-sm font-semibold px-2 py-1 bg-green-100 rounded-full">
                      KYC Verified
                    </span>
                  ) : (
                    <Button variant="secondary" size="sm" className="mt-2" onClick={() => navigate("/kyc")}>
                      Complete KYC
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          {!editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(true)}>
                Edit Profile
              </Button>
              <div className="space-y-4 mt-8">
                <h3 className="text-base font-semibold">About</h3>
                <p className="text-sm text-muted-foreground">Bio: {data?.profile?.bio || "-"}</p>
                <p className="text-sm text-muted-foreground">{data?.age && `${data.age} y/o`}</p>
                <p className="text-sm text-muted-foreground">{data?.ridesCreated.length} rides published</p>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(data?.createdAt).getFullYear()}
                </p>
              </div>
              <div className="space-y-4 mt-8">
                <h3 className="text-base font-semibold">Preferences</h3>
                {Object.entries(data?.profile?.preferences || {}).map(([key, value]) => (
                  <p className="text-sm text-muted-foreground" key={key}>
                    {key[0].toUpperCase() + key.slice(1)}: {value}
                  </p>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 mt-4">
              {["name", "bio", "age"].map((field) => (
                <Fragment key={field}>
                  <Label htmlFor={field}>{field[0].toUpperCase() + field.slice(1)}</Label>
                  <Controller
                    name={field}
                    control={control}
                    render={({ field }) =>
                      field.name === "bio" ? (
                        <Textarea id={field.name} {...field} />
                      ) : (
                        <Input id={field.name} {...field} type={field.name === "age" ? "number" : "text"} />
                      )
                    }
                  />
                </Fragment>
              ))}

              {Object.entries(preferenceOptions).map(([key, options]) => (
                <Fragment key={key}>
                  <Label htmlFor={key}>{key[0].toUpperCase() + key.slice(1)}</Label>
                  <Controller
                    name={key}
                    control={control}
                    render={({ field }) => (
                      <select id={key} {...field} className="border p-2 rounded">
                        <option value="">Select {key}</option>
                        {options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                  />
                </Fragment>
              ))}

              <div className="flex gap-2 mt-4">
                <Button type="submit">Save</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditMode(false)
                    reset()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Rides Area */}
        <div className="flex flex-col w-full sm:w-2/3 gap-6">
          <section>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Published Rides</h2>
              <Pencil
                className={`cursor-pointer p-1 rounded-lg ${rideDeleteMode ? "bg-primary text-white" : ""}`}
                onClick={() => setRideDeleteMode((prev) => !prev)}
              />
            </div>
            <ScrollArea className="h-[275px] mt-3 rounded-md border p-4">
              {data?.ridesCreated.map((ride) => (
                <Fragment key={ride._id}>
                  <RideCard details={ride} />
                  {rideDeleteMode && (
                    <Trash className="text-destructive cursor-pointer mt-2" onClick={() => handleDelete(ride._id)} />
                  )}
                </Fragment>
              ))}
            </ScrollArea>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Recently Joined Rides</h2>
            <ScrollArea className="h-[275px] mt-3 rounded-md border p-4">
              {data?.ridesJoined.map((ride) => (
                <RideCard key={ride._id} details={ride} />
              ))}
            </ScrollArea>
          </section>
        </div>
      </div>
      <Toaster />
    </main>
  )
}

export default Profile
