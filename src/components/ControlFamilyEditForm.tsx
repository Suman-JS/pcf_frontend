import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";
import {
    Form,
    FormGroup,
    FormItem,
    Label,
    Input,
    Button,
    InputType,
    ButtonType,
    FCLLayout,
    TextArea,
} from "@ui5/webcomponents-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState.js";
import toast from "react-hot-toast";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";

type ControlFamilyData = {
    id: number;
    controlFamilyName: string;
    controlFamilyDescription: string;
};

type ControlFamilyEditFormProps = {
    setIsEdit: Dispatch<SetStateAction<boolean>>;
    setIsFullScreen: Dispatch<SetStateAction<boolean>>;
    setLayout: Dispatch<SetStateAction<FCLLayout>>;
};

const schema = z.object({
    controlFamilyName: z.string().min(1, { message: "Name is required" }),
    controlFamilyDescription: z
        .string()
        .min(1, { message: "Description is required" }),
});

const ControlFamilyEditForm = ({
    id,
    controlFamilyName,
    controlFamilyDescription,
    setIsEdit,
    setLayout,
    setIsFullScreen,
}: ControlFamilyEditFormProps & ControlFamilyData) => {
    const queryClient = useQueryClient();
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id,
            controlFamilyName,
            controlFamilyDescription,
        },
        mode: "onChange",
        resolver: zodResolver(schema),
    });

    const endPoint = `${import.meta.env.VITE_BACKEND_BASE_URL}/control-family-master/update-control-family`;

    const updateControlFamily = async (data: ControlFamilyData) => {
        try {
            const updateData = {
                id,
                control_family_name: data.controlFamilyName,
                control_family_desc: data.controlFamilyDescription,
                customer_id: 1,
            };
            const response = await axios.patch(endPoint, updateData);

            if (response.data?.statuscode === 400) {
                throw response.data?.message;
            }
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            setIsEdit(false);
        }
    };

    const onSubmit = async (data: ControlFamilyData) => {
        await toast.promise(updateControlFamily(data), {
            loading: "Updating control...",
            success: "Control updated successfully!",
            error: (error) => `Failed to update control: ${error.message}`,
        });
        await queryClient.invalidateQueries({
            queryKey: ["allControlFamilyData"],
        });
        setIsEdit(false);
        setIsFullScreen(false);
        setLayout(FCLLayout.OneColumn);
    };

    return (
        <Form
            onSubmit={handleSubmit(onSubmit)}
            labelSpanM={4}
            className="flex items-center justify-center"
        >
            <FormGroup>
                <FormItem label={<Label required>Control Name</Label>}>
                    <Input
                        {...register("controlFamilyName", { required: true })}
                        valueState={
                            errors.controlFamilyName
                                ? ValueState.Error
                                : ValueState.None
                        }
                        valueStateMessage={
                            <span>{errors.controlFamilyName?.message}</span>
                        }
                        type={InputType.Text}
                        className="w-full"
                    />
                </FormItem>
                <FormItem label={<Label required>Control Description</Label>}>
                    <TextArea
                        {...register("controlFamilyDescription", {
                            required: true,
                        })}
                        valueState={
                            errors.controlFamilyDescription
                                ? ValueState.Error
                                : ValueState.None
                        }
                        valueStateMessage={
                            <span>{errors.controlFamilyDescription?.message}</span>
                        }
                        className="w-full"
                    />
                </FormItem>
            </FormGroup>
            <FormItem>
                <Button design="Positive" type={ButtonType.Submit}>
                    Update
                </Button>
            </FormItem>
        </Form>
    );
};

export default ControlFamilyEditForm;
