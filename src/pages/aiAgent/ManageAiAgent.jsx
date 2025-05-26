import React, { useState } from 'react';
import {
  Box,
  Button,
  Tabs,
  Input,
  Textarea,
  Switch,
  Select,
  Badge,
  VStack,
  HStack,
  SimpleGrid,
  Avatar,
  Heading,
  Text,
  IconButton,
  Image,
  Tooltip,
  Code
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { IoCopyOutline } from "react-icons/io5";
import { IoIosAddCircleOutline } from "react-icons/io";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu"
import { toast } from 'react-toastify';
import FormColorSelection from '../../components/common/form/FormColorSelection';
import FormSelect from '../../components/common/form/FormSelect';
import { agentPosition, agentVoice } from '../../utils/constant';
import FormInputText from '../../components/common/form/FormInputText';
import FormSwitch from '../../components/common/form/FormSwitch';

const agents = [
  { name: 'Agent One', image: '/agent1.png', status: 'Active' },
  { name: 'Agent Two', image: '/agent2.png', status: 'Inactive' },
];

const validationSchema = Yup.object({
  color1: Yup.string().required('Required'),
  color2: Yup.string().required('Required'),
  color3: Yup.string().required('Required'),
});

export default function ManageAiAgent() {
  const navigate = useNavigate();
  const [agentImg, setAgentImg] = useState(null);
  const [fullAgentImg, setFullAgentImg] = useState(null);

  const handleImageUpload = (event, setImage) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const formik = useFormik({
    initialValues: {
      color1: '',
      color2: '',
      color3: '',
      greetingMsg: [''],
      position: 'right',
      showAgent: true,
      agentVoice: '',
      isVoiceChat: false,
    },
    validationSchema,
    onSubmit: (values) => {
      toast.success('Customization saved');
    },
  });

  console.log("formik",formik?.values);
  

  return (
    <>
    <Tabs.Root defaultValue="customization">
      <Tabs.List>
        <Tabs.Trigger value="customization">
          <LuUser />
          Customization
        </Tabs.Trigger>
        <Tabs.Trigger value="behaviour">
          <LuFolder />
          Behaviour
        </Tabs.Trigger>
        <Tabs.Trigger value="training">
          <LuSquareCheck />
          Training
        </Tabs.Trigger>
         <Tabs.Trigger value="integration">
          <LuSquareCheck />
          Integration
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="customization">
            <form onSubmit={formik.handleSubmit}>
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                    <FormColorSelection label={"color-1"} formik={formik} name={"color1"} handleOnChange={(e,name)=>formik.setFieldValue("color1",e.valueAsString)}/>
                    <FormColorSelection label={"color-2"} formik={formik} name={"color2"} handleOnChange={(e,name)=>formik.setFieldValue("color2",e.valueAsString)}/>
                    <FormColorSelection label={"color-3"} formik={formik} name={"color3"} handleOnChange={(e,name)=>formik.setFieldValue("color3",e.valueAsString)}/>
                </HStack>

                <Text>Greeting Messages (max 3)</Text>
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                {formik.values?.greetingMsg?.map((msg, index) => (
                    <HStack>
                        <FormInputText name={`welcomeMessage[${index}]`} placeholder={`Msg-${index+1}`} formik={formik} handleOnChange={(e,name)=>console.log("e",e,name)}/>
                        {formik.values?.greetingMsg?.length!=1 && <Button onClick={()=>formik.setFieldValue("greetingMsg",formik.values?.greetingMsg?.filter((ele,ind)=>index!=ind))} colorScheme="teal" >-</Button>}
                    </HStack>
                ))}
                </HStack>
                {formik.values?.greetingMsg?.length<3 && <Button colorScheme="teal" onClick={()=>formik.setFieldValue("greetingMsg",[...formik.values?.greetingMsg,''])}>+</Button>}

              </VStack>

                <FormSelect name={"position"} label={"Position"} options={agentPosition} formik={formik} placeholder={"Select"} handleOnChange={(e)=>formik.setFieldValue("position",e.value)}/>

                <HStack>
                  <FormSwitch label={"Show Agent"} name={"showAgent"} formik={formik} handleOnChange={(e)=>formik.setFieldValue("showAgent",e.checked)}/>
                </HStack>

                <Box>
                  <Text>Agent Image</Text>
                  <Input type="file" onChange={(e) => handleImageUpload(e, setAgentImg)} />
                  {agentImg && <Image src={agentImg} alt="Agent" boxSize="100px" mt={2} />}
                </Box>

                <Box>
                  <Text>Full Agent Image</Text>
                  <Input type="file" onChange={(e) => handleImageUpload(e, setFullAgentImg)} />
                  {fullAgentImg && <Image src={fullAgentImg} alt="Full Agent" boxSize="100px" mt={2} />}
                </Box>
                <FormSelect name={"agentVoice"} label={"Voice"} options={agentVoice} formik={formik} placeholder={"Select"} handleOnChange={(e)=>formik.setFieldValue("agentVoice",e.value)}/>

                 <HStack>
                  <FormSwitch label={"Voice Chat"} name={"isVoiceChat"} formik={formik} handleOnChange={(e)=>formik.setFieldValue("isVoiceChat",e.checked)}/>
                </HStack>

                <Button colorScheme="teal" type="submit">Save</Button>
              </VStack>
            </form>
      </Tabs.Content>
      <Tabs.Content value="behaviour">
               <Textarea placeholder="Describe agent behaviour here..." />
            <Button mt={4} colorScheme="teal">Save</Button>
      </Tabs.Content>
      <Tabs.Content value="training">
                    <VStack spacing={4} align="start">
              <Input type="file" accept=".pdf,.doc,.docx" />
              <Input placeholder="FAQ question..." />
              <Input placeholder="Website URL" />
              <Button colorScheme="teal">Upload & Save</Button>
            </VStack>
      </Tabs.Content>
      <Tabs.Content value="integration">
                 {/* <VStack align="start">
              <HStack>
                <Text fontWeight="bold">Embed JS Snippet:</Text>
                <Tooltip label="Copy to clipboard">
                  <IconButton
                    icon={<IoCopyOutline />} 
                    aria-label="Copy snippet" 
                    onClick={() => {
                      navigator.clipboard.writeText('<script src=\"/agent.js\"></script>');
                      toast({ title: 'Snippet copied', status: 'success', duration: 2000 });
                    }}
                  />
                </Tooltip>
              </HStack>
              <Code p={2} rounded="md" bg="gray.100" w="full">{`<script src="/agent.js"></script>`}</Code>
              <Text>API Key: <Badge colorScheme="purple">agent-123-xyz</Badge></Text>
            </VStack> */}
      </Tabs.Content>


    </Tabs.Root>
    {/* <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Heading>AI Agents</Heading>
        <Button leftIcon={<IoIosAddCircleOutline />} colorScheme="teal" onClick={() => navigate('/ai-agent/add-new')}>
          Create AI Agent
        </Button>
      </HStack>

      <SimpleGrid columns={[1, 2, 3]} spacing={6} mb={6}>
        {agents.map((agent, i) => (
          <Box key={i} borderWidth="1px" borderRadius="2xl" p={4} shadow="md">
            <VStack>
              <Avatar size="xl" src={agent.image} name={agent.name} />
              <Text fontSize="xl" fontWeight="bold">{agent.name}</Text>
              <Badge colorScheme={agent.status === 'Active' ? 'green' : 'red'}>{agent.status}</Badge>
              <Button mt={2} onClick={() => navigate('/ai-agent/manage')}>Manage</Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

 


    </Box> */}
    </>
  );
}
