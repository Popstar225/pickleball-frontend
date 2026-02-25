import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import { fetchCourt, deleteCourt, updateCourt } from '@/store/slices/courtsSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Star,
  Users,
  Wifi,
  Droplets,
  Sun,
  Moon,
  Zap,
  CheckCircle2,
  Edit,
  Trash2,
  Share2,
  Bookmark,
  TrendingUp,
  Activity,
  Image as ImageIcon,
  Copy,
  Check,
  AlertTriangle,
  X,
  ExternalLink,
  Download,
  Upload,
  BarChart3,
  MessageSquare,
  Settings,
  Save,
  XCircle,
  Plus,
  Link as LinkIcon,
  FileImage,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CourtDetails() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentCourt: court, loading } = useSelector((s: RootState) => s.courts);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    court_type: '',
    surface: '',
    hourly_rate: '',
    amenities: [] as string[],
    photos: [] as string[],
    club_name: '',
  });

  // New amenity input
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchCourt(id));
  }, [dispatch, id]);

  // Update form when court data loads
  useEffect(() => {
    if (court) {
      setFormData({
        name: court.name || '',
        description: court.description || '',
        court_type: court.court_type || '',
        surface: court.surface || '',
        hourly_rate: court.hourly_rate?.toString() || '',
        amenities: Array.isArray(court.amenities) ? court.amenities : [],
        photos: Array.isArray(court.photos) ? court.photos : [],
        club_name: court.club?.name || court.club_name || '',
      });
    }
  }, [court]);

  // Amenity icon mapping
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return Wifi;
    if (amenityLower.includes('agua') || amenityLower.includes('water')) return Droplets;
    if (amenityLower.includes('luz') || amenityLower.includes('light')) return Sun;
    if (amenityLower.includes('noche') || amenityLower.includes('night')) return Moon;
    if (amenityLower.includes('energía') || amenityLower.includes('power')) return Zap;
    return CheckCircle2;
  };

  // Action handlers
  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: court?.name,
          text: `Mira esta cancha: ${court?.name}`,
          url: url,
        });
        toast({
          title: '¡Compartido!',
          description: 'El enlace ha sido compartido exitosamente',
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: '¡Copiado!',
        description: 'El enlace ha sido copiado al portapapeles',
      });
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast({
      title: bookmarked ? 'Marcador eliminado' : '¡Guardado!',
      description: bookmarked
        ? 'La cancha ha sido eliminada de tus favoritos'
        : 'La cancha ha sido guardada en tus favoritos',
    });
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset form
      if (court) {
        setFormData({
          name: court.name || '',
          description: court.description || '',
          court_type: court.court_type || '',
          surface: court.surface || '',
          hourly_rate: court.hourly_rate?.toString() || '',
          amenities: Array.isArray(court.amenities) ? court.amenities : [],
          photos: Array.isArray(court.photos) ? court.photos : [],
          club_name: court.club?.name || court.club_name || '',
        });
      }
    }
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    if (!id) return;

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre de la cancha es requerido',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0) {
      toast({
        title: 'Error de validación',
        description: 'La tarifa debe ser mayor a 0',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        updateCourt({
          id,
          courtData: {
            name: formData.name,
            description: formData.description,
            court_type: formData.court_type as any,
            surface: formData.surface as any,
            hourly_rate: parseFloat(formData.hourly_rate),
            amenities: formData.amenities,
            photos: formData.photos,
          } as any,
        }),
      ).unwrap();

      toast({
        title: '¡Guardado exitosamente!',
        description: 'Los cambios han sido guardados correctamente',
      });
      setEditMode(false);
      // Refresh data
      dispatch(fetchCourt(id));
    } catch (error: any) {
      toast({
        title: 'Error al guardar',
        description: error?.message || 'No se pudieron guardar los cambios',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setDeleting(true);
    try {
      await dispatch(deleteCourt(id)).unwrap();
      toast({
        title: '¡Eliminado!',
        description: 'La cancha ha sido eliminada exitosamente',
      });
      navigate('/admin/dashboard/courts');
    } catch (error: any) {
      toast({
        title: 'Error al eliminar',
        description: error?.message || 'No se pudo eliminar la cancha',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleViewReservations = () => {
    navigate(`/admin/dashboard/reservations?court=${id}`);
  };

  const handleViewStatistics = () => {
    navigate(`/admin/dashboard/courts/${id}/statistics`);
  };

  const handleViewReviews = () => {
    navigate(`/admin/dashboard/courts/${id}/reviews`);
  };

  const handleViewOnMap = () => {
    if (court?.club?.latitude && court?.club?.longitude) {
      const url = `https://www.google.com/maps?q=${court.club.latitude},${court.club.longitude}`;
      window.open(url, '_blank');
    } else {
      toast({
        title: 'Ubicación no disponible',
        description: 'No se encontraron coordenadas para este club',
        variant: 'destructive',
      });
    }
  };

  const handleViewCalendar = () => {
    navigate(`/admin/dashboard/courts/${id}/calendar`);
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity('');
      toast({
        title: 'Amenidad agregada',
        description: `Se agregó: ${newAmenity.trim()}`,
      });
    }
  };

  const handleRemoveAmenity = (index: number) => {
    const removedAmenity = formData.amenities[index];
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
    toast({
      title: 'Amenidad eliminada',
      description: `Se eliminó: ${removedAmenity}`,
    });
  };

  // Image upload handlers
  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // Simulate upload - in real implementation, upload to server/cloud storage
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Archivo inválido',
            description: `${file.name} no es una imagen válida`,
            variant: 'destructive',
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'Archivo muy grande',
            description: `${file.name} excede el límite de 5MB`,
            variant: 'destructive',
          });
          continue;
        }

        // Create preview URL
        const reader = new FileReader();
        const url = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...uploadedUrls],
        }));

        toast({
          title: '¡Fotos cargadas!',
          description: `Se cargaron ${uploadedUrls.length} foto(s) exitosamente`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error al cargar',
        description: 'Hubo un problema al cargar las fotos',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddPhotoByUrl = () => {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url && url.trim()) {
      // Validate URL format
      try {
        new URL(url);
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, url.trim()],
        }));
        toast({
          title: 'Foto agregada',
          description: 'La imagen ha sido agregada desde la URL',
        });
      } catch {
        toast({
          title: 'URL inválida',
          description: 'Por favor ingresa una URL válida',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    toast({
      title: 'Foto eliminada',
      description: 'La imagen ha sido eliminada',
    });
  };

  const handleDownloadPhotos = async () => {
    if (!formData.photos || formData.photos.length === 0) {
      toast({
        title: 'No hay fotos',
        description: 'No hay fotos para descargar',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Descargando fotos...',
      description: `Descargando ${formData.photos.length} foto(s)`,
    });

    // In a real implementation, this would download or create a ZIP file
    formData.photos.forEach((url, index) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `court-photo-${index + 1}.jpg`;
      link.click();
    });

    setTimeout(() => {
      toast({
        title: '¡Descarga completa!',
        description: 'Las fotos han sido descargadas',
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/dashboard/courts')}
            className="shrink-0 border-primary/20 bg-slate-800/80 hover:bg-slate-800 text-primary hover:text-primary hover:border-primary/40"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {editMode ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="text-3xl lg:text-4xl font-bold h-auto py-2 px-3 bg-slate-800 border-primary/30 text-white focus:border-primary"
                  placeholder="Nombre de la cancha"
                />
              ) : (
                <>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">
                    {loading ? (
                      <span className="inline-block h-9 w-64 bg-slate-700 animate-pulse rounded-lg" />
                    ) : (
                      court?.name || 'Cancha no encontrada'
                    )}
                  </h1>
                  {!loading && court && (
                    <Badge className="bg-primary/20 text-primary border-primary/40 text-sm font-semibold">
                      <Activity className="h-3.5 w-3.5 mr-1.5" />
                      Activa
                    </Badge>
                  )}
                </>
              )}
            </div>
            {!loading && court && !editMode && (
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-base font-medium">
                  {court?.club?.name || court?.club_name || 'Sin club'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  {court?.club?.city}, {court?.club?.state}
                </span>
              </div>
            )}
          </div>
        </div>

        {!loading && court && (
          <div className="flex items-center gap-2 flex-wrap">
            {!editMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-primary/20 bg-slate-800/80 hover:bg-slate-800 text-white font-medium hover:border-primary/40"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmark}
                  className={cn(
                    'border-primary/20 font-medium hover:border-primary/40',
                    bookmarked
                      ? 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/40'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-white',
                  )}
                >
                  <Bookmark className={cn('h-4 w-4 mr-2', bookmarked && 'fill-primary')} />
                  {bookmarked ? 'Guardado' : 'Guardar'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleEditToggle}
                  className="bg-primary hover:bg-primary/90 text-slate-900 font-semibold shadow-lg shadow-primary/30"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="border-red-500/30 bg-red-950/30 hover:bg-red-950/50 text-red-400 hover:text-red-300 font-medium"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                  disabled={saving}
                  className="border-slate-600 bg-slate-800 hover:bg-slate-700 text-white font-medium"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 text-slate-900 font-semibold shadow-lg shadow-primary/30"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-primary/20 bg-slate-800/50">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-slate-700 animate-pulse rounded" />
                  <div className="h-7 w-full bg-slate-700 animate-pulse rounded" />
                  <div className="h-3 w-3/4 bg-slate-700 animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !court ? (
        <Card className="border-primary/20 bg-slate-800/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Cancha no encontrada</h3>
                <p className="text-slate-400 mb-6">
                  No pudimos encontrar la información de esta cancha
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/dashboard/courts')}
                  className="border-primary/30 bg-slate-800 hover:bg-slate-700 text-white hover:border-primary/50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a canchas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary/80 mb-1">Tarifa por hora</p>
                    {editMode ? (
                      <div className="mt-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.hourly_rate}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, hourly_rate: e.target.value }))
                          }
                          className="text-xl font-bold h-auto py-1 px-2 bg-slate-800 border-primary/30 text-white"
                          placeholder="0.00"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-white">
                          ${formData.hourly_rate ? Number(formData.hourly_rate).toFixed(2) : '0.00'}
                        </p>
                        <p className="text-xs font-semibold text-primary mt-2">MXN</p>
                      </>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary/80 mb-1">Tipo de cancha</p>
                    {editMode ? (
                      <Select
                        value={formData.court_type}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, court_type: value }))
                        }
                      >
                        <SelectTrigger className="mt-2 bg-slate-800 border-primary/30 text-white">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-primary/30">
                          <SelectItem value="indoor" className="text-white">
                            Indoor
                          </SelectItem>
                          <SelectItem value="outdoor" className="text-white">
                            Outdoor
                          </SelectItem>
                          <SelectItem value="covered" className="text-white">
                            Cubierta
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-white capitalize">
                          {formData.court_type || '-'}
                        </p>
                        <p className="text-xs font-semibold text-primary mt-2 capitalize">
                          {formData.surface || 'N/A'}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-primary/80 mb-1">Calificación</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-white">4.8</p>
                      <Star className="h-6 w-6 text-primary fill-primary" />
                    </div>
                    <p className="text-xs font-semibold text-primary mt-2">234 reseñas</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-primary/80 mb-1">Reservaciones</p>
                    <p className="text-3xl font-bold text-white">48</p>
                    <p className="text-xs font-semibold text-primary mt-2 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +12% este mes
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photos Gallery */}
              <Card className="border-primary/20 bg-slate-800/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 border-b border-primary/20">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        Galería de fotos
                      </h2>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary border-primary/40 font-semibold">
                          {formData.photos.length} foto{formData.photos.length !== 1 ? 's' : ''}
                        </Badge>
                        {formData.photos.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDownloadPhotos}
                            disabled={!editMode && formData.photos.length === 0}
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {editMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleUploadClick}
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {formData.photos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {formData.photos.map((url, i) => (
                          <div
                            key={i}
                            className="group relative aspect-video rounded-lg overflow-hidden bg-slate-700 border-2 border-transparent hover:border-primary transition-all"
                          >
                            <img
                              src={url}
                              alt={`Cancha foto ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                              onClick={() => !editMode && setSelectedImage(url)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <span className="text-sm font-semibold text-white">Foto {i + 1}</span>
                              {editMode ? (
                                <Button
                                  onClick={() => handleRemovePhoto(i)}
                                  size="icon"
                                  className="h-8 w-8 bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => setSelectedImage(url)}
                                  size="icon"
                                  className="h-8 w-8 bg-primary hover:bg-primary/90 text-slate-900"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mb-4">
                          <ImageIcon className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          No hay fotos disponibles
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                          {editMode
                            ? 'Agrega fotos para mostrar esta cancha'
                            : 'Esta cancha no tiene fotos'}
                        </p>
                        {editMode && (
                          <Button
                            onClick={handleUploadClick}
                            className="bg-primary hover:bg-primary/90 text-slate-900 font-semibold"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Subir fotos
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="border-primary/20 bg-slate-800/50">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Descripción
                  </h2>
                  {editMode ? (
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="min-h-32 bg-slate-700/50 border-primary/30 text-white focus:border-primary resize-none"
                      placeholder="Describe la cancha, sus características y servicios..."
                    />
                  ) : (
                    <p className="text-base text-slate-200 leading-relaxed">
                      {formData.description || (
                        <span className="text-slate-400 italic">
                          No hay descripción disponible para esta cancha.
                        </span>
                      )}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="border-primary/20 bg-slate-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Amenidades
                    </h2>
                  </div>

                  {editMode && (
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
                        placeholder="Agregar nueva amenidad..."
                        className="bg-slate-700/50 border-primary/30 text-white"
                      />
                      <Button
                        onClick={handleAddAmenity}
                        disabled={!newAmenity.trim()}
                        className="bg-primary hover:bg-primary/90 text-slate-900 font-semibold shrink-0"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  )}

                  {formData.amenities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.amenities.map((amenity, i) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/50 border border-primary/20 hover:border-primary/40 hover:bg-slate-700 transition-all group"
                          >
                            <div className="h-11 w-11 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-white font-medium capitalize text-base flex-1">
                              {amenity}
                            </span>
                            {editMode && (
                              <Button
                                onClick={() => handleRemoveAmenity(i)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                      </div>
                      <p className="text-slate-400 text-base">
                        {editMode
                          ? 'Agrega amenidades usando el campo de arriba'
                          : 'No hay amenidades registradas'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Surface Type - Edit Mode Only */}
              {editMode && (
                <Card className="border-primary/20 bg-slate-800/50">
                  <CardContent className="p-6">
                    <Label className="text-white font-semibold text-base mb-3 block">
                      Tipo de Superficie
                    </Label>
                    <Select
                      value={formData.surface}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, surface: value }))
                      }
                    >
                      <SelectTrigger className="bg-slate-700/50 border-primary/30 text-white h-12">
                        <SelectValue placeholder="Seleccionar superficie" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-primary/30">
                        <SelectItem value="concrete" className="text-white">
                          Concreto
                        </SelectItem>
                        <SelectItem value="grass" className="text-white">
                          Pasto Natural
                        </SelectItem>
                        <SelectItem value="synthetic" className="text-white">
                          Pasto Sintético
                        </SelectItem>
                        <SelectItem value="clay" className="text-white">
                          Arcilla
                        </SelectItem>
                        <SelectItem value="wood" className="text-white">
                          Madera
                        </SelectItem>
                        <SelectItem value="rubber" className="text-white">
                          Caucho
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Club Info & Actions */}
            <div className="space-y-6">
              {/* Club Information */}
              <Card className="border-primary/20 bg-slate-800/50">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Información del club
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1.5">
                        Nombre del club
                      </p>
                      <p className="text-white font-semibold text-base">
                        {court?.club?.name || court?.club_name || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1.5">
                        Ubicación
                      </p>
                      <p className="text-white font-semibold text-base">
                        {court?.club?.city}, {court?.club?.state}
                      </p>
                    </div>
                    {court?.club?.address && (
                      <div>
                        <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1.5">
                          Dirección
                        </p>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          {court.club.address}
                        </p>
                      </div>
                    )}
                    <Button
                      onClick={handleViewOnMap}
                      className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-semibold"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Ver en mapa
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card className="border-primary/20 bg-slate-800/50">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Disponibilidad
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-3 border-b border-primary/20">
                      <span className="text-sm font-medium text-slate-300">Lunes - Viernes</span>
                      <span className="text-sm font-bold text-white">6:00 - 22:00</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-primary/20">
                      <span className="text-sm font-medium text-slate-300">Sábado</span>
                      <span className="text-sm font-bold text-white">7:00 - 23:00</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium text-slate-300">Domingo</span>
                      <span className="text-sm font-bold text-white">8:00 - 20:00</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleViewCalendar}
                    className="w-full mt-4 bg-primary hover:bg-primary/90 text-slate-900 font-semibold"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver calendario completo
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              {!editMode && (
                <Card className="border-primary/20 bg-slate-800/50">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Acciones rápidas
                    </h2>
                    <div className="space-y-2">
                      <Button
                        onClick={handleViewReservations}
                        variant="outline"
                        className="w-full justify-start border-primary/20 bg-slate-700/50 hover:bg-slate-700 hover:border-primary/40 text-white font-medium"
                      >
                        <Users className="h-4 w-4 mr-3 text-primary" />
                        Ver reservaciones
                      </Button>
                      <Button
                        onClick={handleViewStatistics}
                        variant="outline"
                        className="w-full justify-start border-primary/20 bg-slate-700/50 hover:bg-slate-700 hover:border-primary/40 text-white font-medium"
                      >
                        <BarChart3 className="h-4 w-4 mr-3 text-primary" />
                        Estadísticas
                      </Button>
                      <Button
                        onClick={handleViewReviews}
                        variant="outline"
                        className="w-full justify-start border-primary/20 bg-slate-700/50 hover:bg-slate-700 hover:border-primary/40 text-white font-medium"
                      >
                        <MessageSquare className="h-4 w-4 mr-3 text-primary" />
                        Ver reseñas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Photos Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-slate-800 border-primary/30 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Upload className="h-6 w-6 text-primary" />
              Subir fotos
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-base">
              Agrega fotos de la cancha desde tu dispositivo o mediante URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white font-semibold mb-2 block">Desde tu dispositivo</Label>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-semibold justify-start"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <FileImage className="h-5 w-5 mr-3" />
                    Seleccionar archivos
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-400 mt-2">
                Formatos: JPG, PNG, GIF • Máximo 5MB por archivo
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">O</span>
              </div>
            </div>

            <div>
              <Label className="text-white font-semibold mb-2 block">Desde una URL</Label>
              <Button
                onClick={handleAddPhotoByUrl}
                variant="outline"
                className="w-full border-primary/20 bg-slate-700/50 hover:bg-slate-700 hover:border-primary/40 text-white font-medium justify-start"
              >
                <LinkIcon className="h-5 w-5 mr-3 text-primary" />
                Agregar desde URL
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setUploadDialogOpen(false)}
              variant="outline"
              className="border-primary/30 bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-primary/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-base">
              ¿Estás seguro de que deseas eliminar la cancha{' '}
              <strong className="text-white font-semibold">"{court?.name}"</strong>? Esta acción no
              se puede deshacer y se eliminarán todas las reservaciones asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="border-primary/30 bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar cancha
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl bg-slate-900 border-primary/30 p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 h-10 w-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
              <img
                src={selectedImage}
                alt="Vista ampliada"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
