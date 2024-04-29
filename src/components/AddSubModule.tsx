import { useState } from "react";
import {
    List,
    StandardListItem,
    Toolbar,
    Title,
    ToolbarSpacer,
    Button,
    Avatar,
    FlexBox,
    Label,
    Text,
    ToolbarDesign,
    AvatarSize,
    FCLLayout,
    FlexibleColumnLayout,
    ButtonDesign,
    FlexBoxDirection,
    Modals,
    MessageBoxTypes,
    MessageBoxActions,
    Card,
} from "@ui5/webcomponents-react";
import { getAllSubModulesType } from "../utils/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loading from "./Loading";
import axios from "axios";
import toast from "react-hot-toast";
import SubModuleEditForm from "./SubModuleEditForm";
import ErrorComponent from "./ErrorComponent";
import NoDataComponent from "./NoDataComponent";

const AddSubModule = () => {
    const [layout, setLayout] = useState<FCLLayout>(FCLLayout.OneColumn);
    const [isEdit, setIsEdit] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedSubModule, setSelectedSubModule] = useState<
        getAllSubModulesType | undefined
    >(undefined);
    const [error, setError] = useState(false);
    const showDeleteConfirmation = Modals.useShowMessageBox();
    const queryClient = useQueryClient();

    const fetchData = async () => {
        try {
            const endPointAllSubModules = `${import.meta.env.VITE_BACKEND_BASE_URL}/submodule-master/get-all-submodules`;
            const response = await axios.get(endPointAllSubModules);
            if (response.data.statuscode !== 200) {
                setError(true);
            }
            setError(false);
            return response.data;
        } catch (error) {
            console.error(error);
            setError(true);
        }
    };
    const { data, isFetching, isError } = useQuery({
        queryKey: ["allSubModulesData"],
        queryFn: fetchData,
        retry: 3,
    });

    const deleteSubModuleData = async (id: number) => {
        const endPoint = `${import.meta.env.VITE_BACKEND_BASE_URL}/submodule-master/delete-submodule`;
        try {
            const data = {
                id,
                customer_id: 1,
            };

            const response = await axios.patch(endPoint, data);
            if (response.data?.statuscode !== 200) {
                setError(true);
                throw response.data?.message;
            }

            return response.data;
        } catch (error) {
            console.error(error);
            setError(true);
            throw error;
        }
    };

    const handleDeleteSubModule = async (id: number) => {
        await toast.promise(deleteSubModuleData(id), {
            loading: "Deleting Sub-Module...",
            success: "Sub-Module deleted successfully!",
            error: (error) => `Failed to delete sub-module: ${error.message}`,
        });
        await queryClient.invalidateQueries({
            queryKey: ["allSubModulesData"],
        });
        setIsEdit(false);
        setIsFullScreen(false);
        setLayout(FCLLayout.OneColumn);
    };

    const submoduleDataRes = data;

    const allSubModuleData: getAllSubModulesType[] = submoduleDataRes?.data;

    if (isError || error) {
        return <ErrorComponent />;
    }

    if (isFetching) {
        return <Loading />;
    }

    if (!isFetching && allSubModuleData === undefined) {
        return <ErrorComponent />;
    }

    if (!isFetching && data?.statuscode !== 200) {
        return <ErrorComponent />;
    }

    if (allSubModuleData.length === 0) {
        return <NoDataComponent />;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onStartColumnClick = (e: any) => {
        const submoduleId = parseInt(e.detail.item.dataset.submoduleId);
        const submodule = allSubModuleData.find(
            (submodule) => Number(submodule.ID) === submoduleId
        );

        setSelectedSubModule(submodule);

        setLayout(FCLLayout.TwoColumnsMidExpanded);
    };

    return (
        <FlexibleColumnLayout
            style={{
                height: "100%",
                width: "100%",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
            }}
            layout={layout}
            startColumn={
                <List onItemClick={onStartColumnClick}>
                    {allSubModuleData?.map((submodule, index) => (
                        <StandardListItem
                            description={submodule.SUBMODULE_DESC}
                            data-subModule-id={submodule.ID}
                            key={`${submodule.ID}-${index}`}
                        >
                            {submodule.DISPLAY_SUBMODULE_NAME}
                        </StandardListItem>
                    ))}
                </List>
            }
            midColumn={
                <>
                    <Toolbar design={ToolbarDesign.Solid}>
                        <Title>{selectedSubModule?.SUBMODULE_NAME}</Title>
                        <ToolbarSpacer />
                        {isFullScreen ? (
                            <Button
                                icon="exit-full-screen"
                                design={ButtonDesign.Transparent}
                                onClick={() => {
                                    setIsFullScreen(!isFullScreen);
                                    setLayout(
                                        FCLLayout.TwoColumnsStartExpanded
                                    );
                                }}
                            />
                        ) : (
                            <Button
                                icon="full-screen"
                                design={ButtonDesign.Transparent}
                                onClick={() => {
                                    setIsFullScreen(!isFullScreen);
                                    setLayout(FCLLayout.MidColumnFullScreen);
                                }}
                            />
                        )}
                        <Button
                            icon="delete"
                            design={ButtonDesign.Transparent}
                            onClick={() => {
                                showDeleteConfirmation({
                                    onClose(event) {
                                        if (event.detail.action === "Delete") {
                                            handleDeleteSubModule(
                                                selectedSubModule
                                                    ? selectedSubModule.ID
                                                    : 0
                                            );
                                        }
                                    },
                                    type: MessageBoxTypes.Warning,
                                    actions: [
                                        MessageBoxActions.Delete,
                                        MessageBoxActions.Cancel,
                                    ],

                                    children:
                                        "Are sure you want to delete this sub-module?",
                                });
                            }}
                        />
                        <Button
                            icon="edit"
                            design={ButtonDesign.Transparent}
                            onClick={() => {
                                setIsEdit(!isEdit);
                            }}
                        />
                        <Button
                            icon="decline"
                            design={ButtonDesign.Transparent}
                            onClick={() => {
                                setLayout(FCLLayout.OneColumn);
                                setIsEdit(false);
                            }}
                        />
                    </Toolbar>
                    <Toolbar
                        key={selectedSubModule?.ID}
                        style={{ height: "200px" }}
                    >
                        <Avatar
                            icon="person-placeholder"
                            size={AvatarSize.XL}
                            style={{ marginLeft: "12px" }}
                        />
                        <FlexBox
                            direction={FlexBoxDirection.Column}
                            style={{ marginLeft: "6px" }}
                        >
                            <FlexBox>
                                <Label>Name:</Label>
                                <Text style={{ marginLeft: "2px" }}>
                                    {selectedSubModule?.SUBMODULE_NAME}
                                </Text>
                            </FlexBox>
                            <FlexBox>
                                <Label>Display Name:</Label>
                                <Text style={{ marginLeft: "2px" }}>
                                    {selectedSubModule?.DISPLAY_SUBMODULE_NAME}
                                </Text>
                            </FlexBox>
                            <FlexBox>
                                <Label>Description:</Label>
                                <Text style={{ marginLeft: "2px" }}>
                                    {selectedSubModule?.SUBMODULE_DESC}
                                </Text>
                            </FlexBox>
                        </FlexBox>
                    </Toolbar>

                    <Card>
                        {isEdit && (
                            <SubModuleEditForm
                                id={
                                    selectedSubModule ? selectedSubModule.ID : 0
                                }
                                subModuleName={
                                    selectedSubModule
                                        ? selectedSubModule.SUBMODULE_NAME
                                        : ""
                                }
                                subModuleDescription={
                                    selectedSubModule
                                        ? selectedSubModule.SUBMODULE_DESC
                                        : ""
                                }
                                displaySubModuleName={
                                    selectedSubModule
                                        ? selectedSubModule.DISPLAY_SUBMODULE_NAME
                                        : ""
                                }
                                setIsEdit={setIsEdit}
                                setIsFullScreen={setIsFullScreen}
                                setLayout={setLayout}
                            />
                        )}
                    </Card>
                </>
            }
        />
    );
};

export default AddSubModule;
