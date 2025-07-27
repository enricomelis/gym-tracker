"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, ChevronUp, Edit, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PresetCardProps {
  id: string;
  name: string;
  description?: string;
  badge?: string;
  details?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  editForm?: React.ReactNode;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

export default function PresetCard({
  id,
  name,
  description,
  badge,
  details,
  onEdit,
  onDelete,
  editForm,
  isExpanded = false,
  onToggleExpand,
  className = "",
}: PresetCardProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete();
      toast({
        title: "Successo",
        description: "Preset eliminato con successo.",
        duration: 1500,
      });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione del preset.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
    setShowEditDialog(true);
  };

  return (
    <>
      <Card
        className={`transition-all duration-200 hover:shadow-md ${className}`}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-medium">{name}</h4>
                  {badge && (
                    <Badge variant="outline" className="shrink-0">
                      {badge}
                    </Badge>
                  )}
                </div>
                {description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="ml-2 flex items-center gap-1">
                {onToggleExpand && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleExpand}
                    className="h-6 w-6 p-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                )}

                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="h-6 w-6 p-0"
                    title="Modifica"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    title="Elimina"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && details && (
              <div className="border-t pt-2">{details}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il preset "{name}"? Questa azione
              non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      {editForm && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifica Preset</DialogTitle>
            </DialogHeader>
            {editForm}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
