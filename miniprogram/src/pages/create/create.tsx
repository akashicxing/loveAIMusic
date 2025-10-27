import { Component } from 'react'
import { View, Text, Button, Progress } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './create.scss'

export default class Create extends Component {

  state = {
    currentStep: 0,
    answers: {},
    lyrics: null,
    selectedStyle: null,
    music: null,
    loading: false
  }

  steps = [
    { title: '回答问题', key: 'questions' },
    { title: '生成歌词', key: 'lyrics' },
    { title: '选择风格', key: 'style' },
    { title: '生成音乐', key: 'music' }
  ]

  nextStep = () => {
    const { currentStep } = this.state
    if (currentStep < this.steps.length - 1) {
      this.setState({
        currentStep: currentStep + 1
      })
    }
  }

  prevStep = () => {
    const { currentStep } = this.state
    if (currentStep > 0) {
      this.setState({
        currentStep: currentStep - 1
      })
    }
  }

  answerQuestion = (questionId, answer) => {
    this.setState({
      answers: {
        ...this.state.answers,
        [questionId]: answer
      }
    })
  }

  selectStyle = (style) => {
    this.setState({
      selectedStyle: style
    })
  }

  renderStepContent = () => {
    const { currentStep, answers, lyrics, selectedStyle, music, loading } = this.state
    
    switch (currentStep) {
      case 0:
        return (
          <View className='step-content'>
            <Text className='step-title'>回答几个问题</Text>
            <Text className='step-desc'>帮助我们了解你的故事</Text>
            
            <View className='questions'>
              <View className='question-item'>
                <Text className='question-text'>你们是怎么认识的？</Text>
                <View className='answer-options'>
                  <Button 
                    className='answer-btn'
                    onClick={() => this.answerQuestion('meet', '朋友介绍')}
                  >
                    朋友介绍
                  </Button>
                  <Button 
                    className='answer-btn'
                    onClick={() => this.answerQuestion('meet', '工作同事')}
                  >
                    工作同事
                  </Button>
                  <Button 
                    className='answer-btn'
                    onClick={() => this.answerQuestion('meet', '网络认识')}
                  >
                    网络认识
                  </Button>
                </View>
              </View>
            </View>
          </View>
        )
      
      case 1:
        return (
          <View className='step-content'>
            <Text className='step-title'>生成歌词</Text>
            <Text className='step-desc'>基于你的故事创作歌词</Text>
            
            {loading ? (
              <View className='loading'>
                <Text className='loading-text'>正在生成歌词...</Text>
              </View>
            ) : lyrics ? (
              <View className='lyrics-content'>
                <Text className='lyrics-text'>{lyrics.content}</Text>
              </View>
            ) : null}
          </View>
        )
      
      case 2:
        return (
          <View className='step-content'>
            <Text className='step-title'>选择音乐风格</Text>
            <Text className='step-desc'>选择你喜欢的音乐风格</Text>
            
            <View className='style-options'>
              <Button 
                className='style-btn'
                onClick={() => this.selectStyle('pop')}
              >
                流行
              </Button>
              <Button 
                className='style-btn'
                onClick={() => this.selectStyle('folk')}
              >
                民谣
              </Button>
              <Button 
                className='style-btn'
                onClick={() => this.selectStyle('rock')}
              >
                摇滚
              </Button>
            </View>
          </View>
        )
      
      case 3:
        return (
          <View className='step-content'>
            <Text className='step-title'>生成音乐</Text>
            <Text className='step-desc'>为你的歌词配上音乐</Text>
            
            {loading ? (
              <View className='loading'>
                <Text className='loading-text'>正在生成音乐...</Text>
              </View>
            ) : music ? (
              <View className='music-content'>
                <Text className='music-title'>音乐生成完成！</Text>
                <Button 
                  className='btn-primary'
                  onClick={() => Taro.showToast({ title: '保存成功', icon: 'success' })}
                >
                  保存作品
                </Button>
              </View>
            ) : null}
          </View>
        )
      
      default:
        return null
    }
  }

  render() {
    const { currentStep, loading } = this.state
    const progress = ((currentStep + 1) / this.steps.length) * 100
    
    return (
      <View className='create'>
        <View className='create-header'>
          <Text className='create-title'>创作情歌</Text>
          <Progress 
            percent={progress}
            strokeWidth={4}
            color='#ff6b9d'
            backgroundColor='#f0f0f0'
          />
          <Text className='step-indicator'>
            {currentStep + 1} / {this.steps.length}
          </Text>
        </View>

        <View className='create-content'>
          {this.renderStepContent()}
        </View>

        <View className='create-footer'>
          {currentStep > 0 && (
            <Button 
              className='btn-secondary'
              onClick={this.prevStep}
            >
              上一步
            </Button>
          )}
          
          {currentStep < this.steps.length - 1 && (
            <Button 
              className='btn-primary'
              onClick={this.nextStep}
              disabled={loading}
            >
              下一步
            </Button>
          )}
        </View>
      </View>
    )
  }
}